"""
港式梭哈 AI 对手 - 重写版

Decision pipeline (priority order):
1. HARD STOP — never fold when check is free
2. EQUITY GUARD — compute pot equity; fold only when calling is -EV AND we truly cannot win
3. HAND QUALITY RULES — never fold with Ace, pair, or better at any street
4. Monte Carlo with opponent visible cards awareness
5. Q-Learning fine-tuning for raise sizing
6. Aggression boost based on difficulty
"""

import random
import json
import os
import math
from typing import List, Dict, Optional, Tuple
from collections import defaultdict, deque
from game_engine import (
    Card, Player, PlayerAction, HandRank,
    evaluate_hand, HKStudGame, GamePhase, HAND_NAMES
)


# ─── Hand Strength Estimation ─────────────────────────────────────────────────

def quick_hand_strength(cards: List[Card]) -> float:
    """
    Fast (non-simulation) hand strength in [0, 1].

    Important: on early streets (2-3 cards) the rank alone is misleading —
    HIGH_CARD = 0 but an Ace-high is still a strong starting hand.
    We add explicit bonuses for high cards and potential.
    """
    if not cards:
        return 0.0
    rank, vals, _ = evaluate_hand(cards)
    base = rank / 9.0  # HandRank.ROYAL_FLUSH = 9

    n = len(cards)
    if vals:
        # High card bonus — scales down as more cards are dealt (relative value decreases)
        hc_bonus = (vals[0] / 12.0) * (0.12 if n <= 2 else 0.07 if n == 3 else 0.04)
        base += hc_bonus

    # Suit draw bonus (flush potential on early streets)
    if n <= 4:
        suits = [c.suit for c in cards]
        max_suit = max(suits.count(s) for s in set(suits))
        if max_suit == n and n >= 2:   # all same suit — flush draw
            base += 0.06 * (n - 1)

    # Straight draw bonus
    if n >= 2:
        vals_u = sorted(set(vals), reverse=True)
        span = vals_u[0] - vals_u[-1] if len(vals_u) >= 2 else 0
        if span <= 4 and len(vals_u) == n:   # no duplicates, within 5-card span
            base += 0.03 * (n - 1)

    return min(base, 1.0)


def monte_carlo_strength(hole_cards: List[Card],
                         visible_cards: List[Card],
                         opponent_visible: List[List[Card]],
                         num_sims: int = 300) -> float:
    """
    Estimate win probability via Monte Carlo simulation.

    Key improvement over previous version:
    - Takes opponent_visible (each opponent's face-up cards) into account.
      Those cards are removed from the deck and opponents get random completions
      only for their hidden hole card.
    - Returns float in [0, 1].
    """
    from game_engine import compare_hands

    wins = 0
    my_cards = hole_cards + visible_cards
    cards_needed_me = 5 - len(my_cards)
    num_opps = len(opponent_visible)

    for _ in range(num_sims):
        # Build deck minus all known cards
        known = set((c.rank, c.suit) for c in my_cards)
        for ovc in opponent_visible:
            for c in ovc:
                known.add((c.rank, c.suit))

        remaining = [Card(r, s)
                     for s in ['♠','♥','♦','♣']
                     for r in ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
                     if (r, s) not in known]
        random.shuffle(remaining)
        deck = remaining[:]

        # Complete my hand
        sim_me = my_cards[:]
        for _ in range(cards_needed_me):
            if deck: sim_me.append(deck.pop())
        if len(sim_me) < 5:
            continue  # degenerate

        # Build each opponent's full hand (visible + random hole card)
        won = True
        for ovc in opponent_visible:
            opp_full = ovc[:]
            cards_needed_opp = 5 - len(opp_full)
            for _ in range(cards_needed_opp):
                if deck: opp_full.append(deck.pop())
            if len(opp_full) < 5:
                continue
            if compare_hands(sim_me, opp_full) <= 0:
                won = False
                break

        if won:
            wins += 1

    return wins / max(num_sims, 1)


def _visible_beats_mine(my_cards: List[Card],
                        opp_visible: List[Card]) -> bool:
    """
    Quick heuristic: can the opponent's VISIBLE cards alone already
    beat my BEST possible hand?  Used as a fast sanity check.
    """
    if len(opp_visible) < 4:
        return False  # not enough info
    opp_rank, _, _ = evaluate_hand(opp_visible)
    if not my_cards:
        return True
    my_rank, _, _ = evaluate_hand(my_cards)
    # If opponent's 4 visible cards are already >= my full 5-card hand
    # and they still have a hole card — almost certainly losing
    return opp_rank >= my_rank and opp_rank >= HandRank.FLUSH


# ─── Q-Learning State Representation ─────────────────────────────────────────

def encode_state(game: HKStudGame, player: Player) -> str:
    vis = player.visible_cards()
    hole = [c for c in player.cards if not c.face_up]
    all_cards = hole + vis

    strength = quick_hand_strength(all_cards)
    strength_bucket = min(int(strength * 10), 9)

    street = {
        GamePhase.STREET_2: 1,
        GamePhase.STREET_3: 2,
        GamePhase.STREET_4: 3,
        GamePhase.STREET_5: 4,
    }.get(game.phase, 1)

    pot = max(game.pot, 1)
    call_amt = game.get_call_amount(player)
    pot_odds = min(int((call_amt / pot) * 4), 3) if call_amt > 0 else 0

    opponents_left = len([p for p in game.players
                          if not p.folded and p is not player])
    opp_bucket = min(max(opponents_left - 1, 0), 2)

    pidx = game.players.index(player)
    n = len(game.players)
    rel_pos = (pidx - game.dealer_idx) % n
    pos = 'D' if rel_pos == 0 else ('E' if rel_pos <= n//3 else ('M' if rel_pos <= 2*n//3 else 'L'))

    is_aggressor = int(game.current_bet > 0 and
                       game.last_raiser_idx == game.players.index(player))

    return f"s{strength_bucket}_st{street}_po{pot_odds}_op{opp_bucket}_{pos}_ag{is_aggressor}"


# ─── Opponent Model ───────────────────────────────────────────────────────────

class OpponentModel:
    def __init__(self, name: str):
        self.name = name
        self.total_actions = 0
        self.action_counts = defaultdict(int)
        self.vpip = 0.5
        self.aggression = 0.5
        self.fold_to_raise = 0.5
        self._history = deque(maxlen=50)

    def record_action(self, action: PlayerAction, pot_odds: float, hand_num: int):
        self.total_actions += 1
        self.action_counts[action] += 1
        self._history.append((action, pot_odds, hand_num))
        self._recalculate()

    def _recalculate(self):
        if self.total_actions < 3:
            return
        folds = self.action_counts.get(PlayerAction.FOLD, 0)
        raises = self.action_counts.get(PlayerAction.RAISE, 0) + \
                 self.action_counts.get(PlayerAction.ALL_IN, 0)
        calls  = self.action_counts.get(PlayerAction.CALL, 0)
        self.fold_to_raise = folds / max(self.total_actions, 1)
        self.aggression    = raises / max(raises + calls, 1)
        self.vpip = (calls + raises) / max(self.total_actions, 1)

    def to_dict(self):
        return {'aggression': self.aggression,
                'fold_to_raise': self.fold_to_raise,
                'vpip': self.vpip}

    def from_dict(self, d):
        self.aggression  = d.get('aggression', 0.5)
        self.fold_to_raise = d.get('fold_to_raise', 0.5)
        self.vpip = d.get('vpip', 0.5)


# ─── Q-Learning Agent ─────────────────────────────────────────────────────────

class QLearningAgent:
    def __init__(self, learning_rate=0.1, discount=0.9,
                 epsilon=0.3, epsilon_decay=0.995, epsilon_min=0.05):
        self.lr = learning_rate
        self.gamma = discount
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min
        self.q_table: Dict[str, Dict[int, float]] = defaultdict(
            lambda: {a: 0.0 for a in range(5)}
        )
        self.experience_replay = deque(maxlen=2000)
        self.games_played = 0
        self.total_winnings = 0
        self.win_rate_history: deque = deque(maxlen=100)
        self._init_priors()

    def _init_priors(self):
        for strength in range(10):
            for street in range(1, 5):
                state = f"s{strength}_st{street}_po0_op1_M_ag0"
                if strength >= 7:
                    self.q_table[state][PlayerAction.RAISE]  =  0.6
                    self.q_table[state][PlayerAction.CALL]   =  0.3
                    self.q_table[state][PlayerAction.CHECK]  =  0.1
                    self.q_table[state][PlayerAction.FOLD]   = -1.0
                elif strength >= 4:
                    self.q_table[state][PlayerAction.CALL]   =  0.3
                    self.q_table[state][PlayerAction.CHECK]  =  0.2
                    self.q_table[state][PlayerAction.FOLD]   = -0.3
                else:
                    self.q_table[state][PlayerAction.FOLD]   =  0.1
                    self.q_table[state][PlayerAction.CHECK]  =  0.2
                    self.q_table[state][PlayerAction.CALL]   = -0.1

    def choose_action(self, state: str, valid_actions: List[PlayerAction],
                      explore: bool = True) -> PlayerAction:
        if explore and random.random() < self.epsilon:
            return random.choice(valid_actions)
        q_vals = self.q_table[state]
        return max(valid_actions, key=lambda a: q_vals.get(a.value, 0.0))

    def store_experience(self, state, action, reward, next_state, done):
        self.experience_replay.append((state, action, reward, next_state, done))

    def learn_from_replay(self, batch_size=32):
        if len(self.experience_replay) < batch_size:
            return
        batch = random.sample(list(self.experience_replay), batch_size)
        for state, action, reward, next_state, done in batch:
            cq = self.q_table[state][action.value]
            tq = reward if done else reward + self.gamma * max(self.q_table[next_state].values())
            self.q_table[state][action.value] += self.lr * (tq - cq)

    def decay_epsilon(self):
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

    def record_game_result(self, net_chips: int, starting_chips: int):
        self.games_played += 1
        self.total_winnings += net_chips
        self.win_rate_history.append(1 if net_chips > 0 else 0)
        self.decay_epsilon()

    @property
    def win_rate(self) -> float:
        if not self.win_rate_history: return 0.5
        return sum(self.win_rate_history) / len(self.win_rate_history)

    def save(self, path: str):
        data = {'epsilon': self.epsilon, 'games_played': self.games_played,
                'total_winnings': self.total_winnings,
                'win_rate_history': list(self.win_rate_history),
                'q_table': {k: v for k, v in self.q_table.items()}}
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def load(self, path: str):
        if not os.path.exists(path): return
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.epsilon = data.get('epsilon', self.epsilon)
        self.games_played = data.get('games_played', 0)
        self.total_winnings = data.get('total_winnings', 0)
        self.win_rate_history = deque(data.get('win_rate_history', []), maxlen=100)
        for k, v in data.get('q_table', {}).items():
            self.q_table[k] = {int(ak): av for ak, av in v.items()}


# ─── AI Player ────────────────────────────────────────────────────────────────

class AIPlayer:
    """
    Full AI player combining Q-Learning + Monte Carlo + hard rational rules.

    Decision pipeline (priority, highest first):
      1. FREE CHECK GUARD — never fold when check costs nothing
      2. CLEAR LOSER DETECTION — fold if visibly dominated with 4 cards out
      3. EQUITY CALCULATION — fold only when equity < pot_odds AND hand is weak
      4. PREMIUM HAND GUARD — never fold with Ace or better rank
      5. Monte Carlo simulation (difficulty-gated)
      6. Q-Learning suggestion
      7. Aggression boost
    """

    DIFFICULTY_SETTINGS = {
        '新手': {'sim_freq': 0.15, 'explore': True,  'epsilon_base': 0.50, 'aggr': 0.20},
        '普通': {'sim_freq': 0.40, 'explore': True,  'epsilon_base': 0.25, 'aggr': 0.40},
        '高手': {'sim_freq': 0.75, 'explore': False, 'epsilon_base': 0.10, 'aggr': 0.62},
        '大师': {'sim_freq': 1.00, 'explore': False, 'epsilon_base': 0.05, 'aggr': 0.78},
    }

    def __init__(self, player: Player, difficulty: str = '普通',
                 model_path: Optional[str] = None):
        self.player = player
        self.difficulty = difficulty
        self.settings = self.DIFFICULTY_SETTINGS.get(difficulty, self.DIFFICULTY_SETTINGS['普通'])
        self.agent = QLearningAgent(epsilon=self.settings['epsilon_base'])
        self.opponent_models: Dict[str, OpponentModel] = {}
        self.model_path = model_path or f"ai_model_{player.name}.json"
        self._episode_states: List[str] = []
        self._episode_actions: List[PlayerAction] = []
        self._start_chips = player.chips
        self._last_state: Optional[str] = None
        self._last_action: Optional[PlayerAction] = None
        self.agent.load(self.model_path)

    # ── Core decision ──────────────────────────────────────────────────────────

    def get_action(self, game: HKStudGame) -> Tuple[PlayerAction, int]:
        player = self.player
        original_valid = game.get_valid_actions(player)
        valid = list(original_valid)
        state = encode_state(game, player)

        hole  = [c for c in player.cards if not c.face_up]
        vis   = player.visible_cards()
        all_cards = hole + vis
        n_cards = len(all_cards)

        # ── 0. Nothing to decide ────────────────────────────────────────────
        if len(valid) == 1:
            action = valid[0]
            self._record(state, action)
            return action, self._raise_size(game, player, None)

        # ── 1. FREE CHECK GUARD: never pay to fold when check is free ───────
        if PlayerAction.CHECK in valid:
            # Can never be correct to fold when check is free
            valid = [a for a in valid if a != PlayerAction.FOLD]

        # ── 2. Compute basic hand metrics ────────────────────────────────────
        qs = quick_hand_strength(all_cards)
        call_amt  = game.get_call_amount(player)
        pot       = max(game.pot, 1)
        pot_odds  = call_amt / (pot + call_amt) if call_amt > 0 else 0.0
        # Pot odds: the fraction of the final pot you'd be contributing

        has_premium = (
            any(c.rank == 'A' for c in all_cards)          or  # any Ace
            any(c.rank == 'K' for c in all_cards)          or  # any King
            qs >= (1.0 / 9.0)                                  # pair or better
        )

        # ── 3. CLEAR LOSER DETECTION (street 4-5 only) ──────────────────────
        # If an opponent's visible cards already form a hand that beats our
        # absolute best possible hand, fold (unless check is free — already handled).
        if n_cards >= 3 and PlayerAction.FOLD in valid and call_amt > 0:
            active_opps = [p for p in game.players
                           if not p.folded and p is not player]
            for opp in active_opps:
                if _visible_beats_mine(all_cards, opp.visible_cards()):
                    action = PlayerAction.FOLD
                    self._record(state, action)
                    return action, 0

        # ── 4. Monte Carlo equity ────────────────────────────────────────────
        mc_equity: Optional[float] = None
        if random.random() < self.settings['sim_freq'] and len(all_cards) >= 1:
            active_opps = [p for p in game.players
                           if not p.folded and p is not player]
            opp_visible = [p.visible_cards() for p in active_opps]
            if active_opps:
                mc_equity = monte_carlo_strength(
                    hole, vis, opp_visible, num_sims=250
                )

        equity = mc_equity if mc_equity is not None else qs

        # ── 5. EQUITY-BASED FOLD DECISION ────────────────────────────────────
        # Only fold when:
        #   a) We must pay to continue (call_amt > 0)
        #   b) Our equity is below pot_odds (negative EV)
        #   c) Our equity is genuinely bad (< threshold for this street)
        #   d) We don't hold a premium hand
        if PlayerAction.FOLD in valid and call_amt > 0 and not has_premium:
            street_equity_floor = {1: 0.08, 2: 0.10, 3: 0.14, 4: 0.18, 5: 0.20}.get(n_cards, 0.15)
            # Fold only if clearly -EV AND equity is bad
            clearly_negative_ev = equity < pot_odds and equity < street_equity_floor
            if not clearly_negative_ev:
                valid = [a for a in valid if a != PlayerAction.FOLD]
        elif PlayerAction.FOLD in valid and has_premium:
            # Premium hand — never fold regardless of cost
            valid = [a for a in valid if a != PlayerAction.FOLD]

        # Safety: if we removed everything, restore
        if not valid:
            valid = [a for a in original_valid if a != PlayerAction.FOLD] or original_valid

        # ── 6. Q-Learning suggestion ─────────────────────────────────────────
        action = self.agent.choose_action(state, valid, explore=self.settings['explore'])

        # ── 7. Monte Carlo override (strong signals) ─────────────────────────
        if mc_equity is not None:
            if mc_equity > 0.60 and PlayerAction.RAISE in valid:
                action = PlayerAction.RAISE
            elif mc_equity > 0.45 and action == PlayerAction.CHECK and PlayerAction.RAISE in valid:
                action = PlayerAction.RAISE  # don't be passive with decent equity
            elif mc_equity < 0.20 and call_amt > 0 and PlayerAction.FOLD in valid:
                action = PlayerAction.FOLD  # genuinely lost, fold if allowed

        # ── 8. Aggression boost ───────────────────────────────────────────────
        aggr = self.settings['aggr']
        if action == PlayerAction.CHECK and PlayerAction.RAISE in valid and equity > 0.42:
            if random.random() < aggr:
                action = PlayerAction.RAISE
        elif action == PlayerAction.CALL and PlayerAction.RAISE in valid and equity > 0.60:
            if random.random() < aggr * 0.65:
                action = PlayerAction.RAISE

        # ── 9. Opponent modeling ──────────────────────────────────────────────
        action = self._apply_opponent_modeling(action, valid, game)

        self._record(state, action)

        raise_to = self._raise_size(game, player, equity) if action == PlayerAction.RAISE else 0
        return action, raise_to

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _record(self, state: str, action: PlayerAction):
        self._last_state = state
        self._last_action = action
        self._episode_states.append(state)
        self._episode_actions.append(action)

    def _raise_size(self, game: HKStudGame, player: Player,
                    equity: Optional[float]) -> int:
        """Pot-proportional raise sizing — bigger with stronger hands."""
        e = equity if equity is not None else 0.5
        pot = max(game.pot, 1)
        if e > 0.80:   mult = 1.10
        elif e > 0.65: mult = 0.80
        elif e > 0.50: mult = 0.55
        else:          mult = 0.40   # bluff-size
        raise_size = int(pot * mult)
        raise_to = game.current_bet + max(raise_size, game.min_raise)
        return min(raise_to, player.chips + player.bet_this_round)

    def _apply_opponent_modeling(self, action: PlayerAction,
                                  valid: List[PlayerAction],
                                  game: HKStudGame) -> PlayerAction:
        opps = [p for p in game.players if not p.folded and p is not self.player]
        if not opps: return action
        tight = sum(1 for p in opps
                    if self.opponent_models.get(p.name,
                       OpponentModel(p.name)).fold_to_raise > 0.55)
        if tight > 0 and action == PlayerAction.CHECK and PlayerAction.RAISE in valid:
            if random.random() < 0.35:
                return PlayerAction.RAISE
        return action

    def record_opponent_action(self, opp_name: str, action: PlayerAction,
                                pot_odds: float, hand_num: int):
        if opp_name not in self.opponent_models:
            self.opponent_models[opp_name] = OpponentModel(opp_name)
        self.opponent_models[opp_name].record_action(action, pot_odds, hand_num)

    def end_episode(self, final_chips: int):
        net = final_chips - self._start_chips
        self._start_chips = final_chips
        if self._episode_states:
            final_reward = net / max(abs(net), 1) * min(abs(net) / 100, 2.0)
            n = len(self._episode_states)
            for i, (st, ac) in enumerate(zip(self._episode_states, self._episode_actions)):
                done = (i == n-1)
                r = final_reward if done else 0.01
                ns = self._episode_states[i+1] if i < n-1 else st
                self.agent.store_experience(st, ac, r, ns, done)
        self.agent.learn_from_replay(batch_size=32)
        self.agent.record_game_result(net, self._start_chips)
        self._episode_states.clear()
        self._episode_actions.clear()

    def save_model(self):
        self.agent.save(self.model_path)

    def get_stats(self) -> dict:
        return {
            'games_played': self.agent.games_played,
            'win_rate': f"{self.agent.win_rate * 100:.1f}%",
            'epsilon': f"{self.agent.epsilon:.3f}",
            'total_winnings': self.agent.total_winnings,
            'q_table_size': len(self.agent.q_table),
        }

    def get_thinking_text(self, game: HKStudGame) -> str:
        player = self.player
        vis  = player.visible_cards()
        hole = [c for c in player.cards if not c.face_up]
        all_c = hole + vis
        strength = quick_hand_strength(all_c)
        rank, _, hname = evaluate_hand(all_c) if all_c else (0, [], '无牌')
        call_amt = game.get_call_amount(player)
        pot = max(game.pot, 1)
        pot_odds = call_amt / (pot + call_amt) if call_amt else 0.0
        ev = "正EV" if strength > pot_odds else "负EV"
        return (f"手牌: {hname}  强度: {strength:.0%}\n"
                f"底池赔率: {pot_odds:.0%}  判断: {ev}")


# ─── Self-Play Training ───────────────────────────────────────────────────────

def self_play_training(num_games: int = 500, num_ai: int = 3,
                       save_path: str = "trained_ai.json",
                       progress_callback=None):
    """Train AI through self-play."""
    names = ["训练甲", "训练乙", "训练丙", "训练丁"][:num_ai]
    players = [Player(n, 1000) for n in names]
    ai_list  = [AIPlayer(p, '大师', save_path) for p in players]
    game     = HKStudGame(players, ante=10, min_bet=20)
    win_counts: Dict[str, int] = defaultdict(int)

    for g in range(num_games):
        # Reset chips periodically
        if any(p.chips <= 0 for p in players):
            for p in players: p.chips = 1000

        game.start_round()
        for ai in ai_list: ai._start_chips = ai.player.chips

        # Play out the round
        max_actions = 50
        actions_taken = 0
        while game.phase not in (GamePhase.ROUND_END, GamePhase.SHOWDOWN) and actions_taken < max_actions:
            from game_engine import GamePhase as GP
            cp_idx = game.active_player_idx
            cp = game.players[cp_idx]
            if cp.folded or cp.all_in:
                np_ = game.next_active_player()
                if np_ is None:
                    game.do_showdown(); break
                cp = np_
            ai = next((a for a in ai_list if a.player is cp), None)
            if ai is None: break
            action, raise_to = ai.get_action(game)
            valid = game.get_valid_actions(cp)
            if action not in valid: action = valid[0]
            game.process_action(cp, action, raise_to)
            actions_taken += 1
            if game.phase in (GP.ROUND_END, GP.SHOWDOWN): break
            np_ = game.next_active_player()
            if np_ is None: game.do_showdown(); break

        for w in game.winners:
            win_counts[w.name] += 1
        for ai in ai_list:
            ai.end_episode(ai.player.chips)

        if progress_callback and (g+1) % 10 == 0:
            progress_callback(g+1, num_games, dict(win_counts))

    # Save the best-performing AI's model
    best = max(ai_list, key=lambda a: a.agent.win_rate)
    best.agent.save(save_path)
    return win_counts