"""
港式梭哈 (Hong Kong Stud Poker) - Game Engine
Rules:
- 5-card stud poker, Hong Kong variant
- Each player gets 1 face-down card (hole), then 4 face-up cards one at a time
- Betting round after each new card (4 rounds total, streets 2-5)
- Highest visible card on table opens each betting round
- Ante collected before each hand
- Standard poker hand rankings apply
"""

import random
from enum import IntEnum
from dataclasses import dataclass, field
from typing import List, Optional, Tuple
from collections import Counter


# ─── Card Definitions ─────────────────────────────────────────────────────────

SUITS = ['♠', '♥', '♦', '♣']
RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
RANK_VALUES = {r: i for i, r in enumerate(RANKS)}
SUIT_COLORS = {'♠': '#1a1a2e', '♣': '#1a1a2e', '♥': '#c0392b', '♦': '#c0392b'}


@dataclass
class Card:
    rank: str
    suit: str
    face_up: bool = True

    def value(self) -> int:
        return RANK_VALUES[self.rank]

    def suit_value(self) -> int:
        return SUITS.index(self.suit)

    @property
    def color(self) -> str:
        return SUIT_COLORS[self.suit]

    @property
    def is_red(self) -> bool:
        return self.suit in ('♥', '♦')

    def __repr__(self):
        return f"{self.rank}{self.suit}"


class Deck:
    def __init__(self):
        self.cards = [Card(r, s) for s in SUITS for r in RANKS]
        random.shuffle(self.cards)

    def deal(self) -> Card:
        return self.cards.pop()


# ─── Hand Evaluation ──────────────────────────────────────────────────────────

class HandRank(IntEnum):
    HIGH_CARD      = 0
    ONE_PAIR       = 1
    TWO_PAIR       = 2
    THREE_OF_KIND  = 3
    STRAIGHT       = 4
    FLUSH          = 5
    FULL_HOUSE     = 6
    FOUR_OF_KIND   = 7
    STRAIGHT_FLUSH = 8
    ROYAL_FLUSH    = 9

HAND_NAMES = {
    HandRank.HIGH_CARD:      '高牌',
    HandRank.ONE_PAIR:       '一对',
    HandRank.TWO_PAIR:       '两对',
    HandRank.THREE_OF_KIND:  '三条',
    HandRank.STRAIGHT:       '顺子',
    HandRank.FLUSH:          '同花',
    HandRank.FULL_HOUSE:     '葫芦',
    HandRank.FOUR_OF_KIND:   '四条',
    HandRank.STRAIGHT_FLUSH: '同花顺',
    HandRank.ROYAL_FLUSH:    '皇家同花顺',
}


def evaluate_hand(cards: List[Card]) -> Tuple[HandRank, List[int], str]:
    """Evaluate a poker hand. Returns (rank, tiebreak_values, name)."""
    if not cards:
        return HandRank.HIGH_CARD, [], '无牌'

    vals = sorted([c.value() for c in cards], reverse=True)
    suits = [c.suit for c in cards]
    n = len(cards)
    rank_counts = Counter(vals)
    counts = sorted(rank_counts.values(), reverse=True)
    count_vals = sorted(rank_counts.keys(),
                        key=lambda v: (rank_counts[v], v), reverse=True)

    is_flush = (n == 5) and len(set(suits)) == 1
    is_straight = False
    straight_high = 0

    if n == 5 and len(rank_counts) == 5:
        if vals[0] - vals[-1] == 4:
            is_straight, straight_high = True, vals[0]
        elif vals == [12, 3, 2, 1, 0]:  # A-2-3-4-5 wheel
            is_straight, straight_high = True, 3

    if n < 5:
        if counts[0] == 4:
            return HandRank.FOUR_OF_KIND, count_vals, HAND_NAMES[HandRank.FOUR_OF_KIND]
        if counts[0] == 3:
            return HandRank.THREE_OF_KIND, count_vals, HAND_NAMES[HandRank.THREE_OF_KIND]
        if counts[0] == 2 and len(counts) > 1 and counts[1] == 2:
            return HandRank.TWO_PAIR, count_vals, HAND_NAMES[HandRank.TWO_PAIR]
        if counts[0] == 2:
            return HandRank.ONE_PAIR, count_vals, HAND_NAMES[HandRank.ONE_PAIR]
        return HandRank.HIGH_CARD, vals, HAND_NAMES[HandRank.HIGH_CARD]

    if is_straight and is_flush:
        if straight_high == 12:
            return HandRank.ROYAL_FLUSH, [12], HAND_NAMES[HandRank.ROYAL_FLUSH]
        return HandRank.STRAIGHT_FLUSH, [straight_high], HAND_NAMES[HandRank.STRAIGHT_FLUSH]
    if counts[0] == 4:
        return HandRank.FOUR_OF_KIND, count_vals, HAND_NAMES[HandRank.FOUR_OF_KIND]
    if counts[0] == 3 and counts[1] == 2:
        return HandRank.FULL_HOUSE, count_vals, HAND_NAMES[HandRank.FULL_HOUSE]
    if is_flush:
        return HandRank.FLUSH, vals, HAND_NAMES[HandRank.FLUSH]
    if is_straight:
        return HandRank.STRAIGHT, [straight_high], HAND_NAMES[HandRank.STRAIGHT]
    if counts[0] == 3:
        return HandRank.THREE_OF_KIND, count_vals, HAND_NAMES[HandRank.THREE_OF_KIND]
    if counts[0] == 2 and counts[1] == 2:
        return HandRank.TWO_PAIR, count_vals, HAND_NAMES[HandRank.TWO_PAIR]
    if counts[0] == 2:
        return HandRank.ONE_PAIR, count_vals, HAND_NAMES[HandRank.ONE_PAIR]
    return HandRank.HIGH_CARD, vals, HAND_NAMES[HandRank.HIGH_CARD]


def compare_hands(a: List[Card], b: List[Card]) -> int:
    ra, va, _ = evaluate_hand(a)
    rb, vb, _ = evaluate_hand(b)
    if ra != rb:
        return 1 if ra > rb else -1
    for x, y in zip(va, vb):
        if x != y:
            return 1 if x > y else -1
    return 0


# ─── Player & Actions ─────────────────────────────────────────────────────────

class PlayerAction(IntEnum):
    FOLD   = 0
    CHECK  = 1
    CALL   = 2
    RAISE  = 3
    ALL_IN = 4

ACTION_NAMES = {
    PlayerAction.FOLD:   '弃牌',
    PlayerAction.CHECK:  '过牌',
    PlayerAction.CALL:   '跟注',
    PlayerAction.RAISE:  '加注',
    PlayerAction.ALL_IN: '全押',
}


@dataclass
class Player:
    name: str
    chips: int
    is_human: bool = False
    cards: List[Card] = field(default_factory=list)
    bet_this_round: int = 0
    total_bet: int = 0
    folded: bool = False
    all_in: bool = False
    is_dealer: bool = False

    def visible_cards(self) -> List[Card]:
        return [c for c in self.cards if c.face_up]

    def best_visible_card(self) -> Optional[Card]:
        vis = self.visible_cards()
        if not vis:
            return None
        return max(vis, key=lambda c: (c.value(), c.suit_value()))

    def reset_for_round(self):
        self.cards.clear()
        self.bet_this_round = 0
        self.total_bet = 0
        self.folded = False
        self.all_in = False
        self.is_dealer = False

    def can_act(self) -> bool:
        return not self.folded and not self.all_in and self.chips > 0

    def place_bet(self, amount: int) -> int:
        actual = min(amount, self.chips)
        self.chips -= actual
        self.bet_this_round += actual
        self.total_bet += actual
        if self.chips == 0:
            self.all_in = True
        return actual


# ─── Game Phase ───────────────────────────────────────────────────────────────

class GamePhase(IntEnum):
    WAITING   = 0
    DEAL_HOLE = 1
    STREET_2  = 2
    STREET_3  = 3
    STREET_4  = 4
    STREET_5  = 5
    SHOWDOWN  = 6
    ROUND_END = 7


PHASE_NAMES = {
    GamePhase.WAITING:   '等待开始',
    GamePhase.DEAL_HOLE: '发底牌',
    GamePhase.STREET_2:  '第二街',
    GamePhase.STREET_3:  '第三街',
    GamePhase.STREET_4:  '第四街',
    GamePhase.STREET_5:  '第五街',
    GamePhase.SHOWDOWN:  '摊牌',
    GamePhase.ROUND_END: '本局结束',
}


# ─── Game Logic ───────────────────────────────────────────────────────────────

class HKStudGame:
    def __init__(self, players: List[Player], ante: int = 10, min_bet: int = 20):
        self.players = players
        self.ante = ante
        self.min_bet = min_bet

        self.pot = 0
        self.current_bet = 0
        self.min_raise = min_bet
        self.deck: Optional[Deck] = None
        self.phase = GamePhase.WAITING
        self.active_player_idx = 0
        self.dealer_idx = -1
        self.round_num = 0
        self.last_raiser_idx = -1
        self.action_log: List[str] = []
        self.winners: List[Player] = []
        self.betting_round_start_idx = 0
        self._acted_this_round: set = set()  # player names who acted in current betting round

    def log(self, msg: str):
        self.action_log.append(msg)
        if len(self.action_log) > 200:
            self.action_log.pop(0)

    def active_players(self) -> List[Player]:
        return [p for p in self.players if not p.folded]

    def players_in_game(self) -> List[Player]:
        return [p for p in self.players if p.chips > 0 or not p.folded]

    def start_round(self):
        self.round_num += 1
        self.pot = 0
        self.current_bet = 0
        self.min_raise = self.min_bet
        self.winners.clear()
        self.deck = Deck()
        self.action_log.clear()

        eligible = [p for p in self.players if p.chips > 0]
        for p in eligible:
            p.reset_for_round()

        self.dealer_idx = (self.dealer_idx + 1) % len(eligible)
        eligible[self.dealer_idx].is_dealer = True

        # Collect antes
        for p in eligible:
            paid = p.place_bet(self.ante)
            self.pot += paid
            p.bet_this_round = 0  # reset after ante (ante doesn't count as bet)

        self.log(f"=== 第 {self.round_num} 局 ===")
        self.log(f"底注 {self.ante}/人，底池: {self.pot}")

        # Deal hole cards face-down
        for p in eligible:
            card = self.deck.deal()
            card.face_up = False
            p.cards.append(card)

        self.phase = GamePhase.STREET_2
        self._start_betting_street()

    def _start_betting_street(self):
        # Deal one face-up card to each active player
        if self.phase != GamePhase.STREET_2:
            for p in self.active_players():
                card = self.deck.deal()
                card.face_up = True
                p.cards.append(card)

        street_num = {
            GamePhase.STREET_2: 2,
            GamePhase.STREET_3: 3,
            GamePhase.STREET_4: 4,
            GamePhase.STREET_5: 5,
        }.get(self.phase, 0)

        if self.phase == GamePhase.STREET_2:
            # Street 2 needs the first face-up card dealt
            for p in self.active_players():
                card = self.deck.deal()
                card.face_up = True
                p.cards.append(card)

        self.log(f"--- 第 {street_num} 街 ---")

        self.current_bet = 0
        self.min_raise = self.min_bet
        self.last_raiser_idx = -1
        self._acted_this_round = set()
        for p in self.players:
            p.bet_this_round = 0

        opener_idx = self._find_opener()
        self.active_player_idx = opener_idx
        self.betting_round_start_idx = opener_idx

        opener = self.players[opener_idx]
        best = opener.best_visible_card()
        if best:
            self.log(f"{opener.name} 最高明牌 [{best}]，先手")

    def _find_opener(self) -> int:
        best_idx = -1
        best_val = -1
        best_suit = -1
        for i, p in enumerate(self.players):
            if p.folded:
                continue
            card = p.best_visible_card()
            if card is None:
                continue
            if (card.value() > best_val or
               (card.value() == best_val and card.suit_value() > best_suit)):
                best_val = card.value()
                best_suit = card.suit_value()
                best_idx = i
        if best_idx == -1:
            for i, p in enumerate(self.players):
                if not p.folded:
                    best_idx = i
                    break
        return best_idx

    def get_valid_actions(self, player: Player) -> List[PlayerAction]:
        actions = [PlayerAction.FOLD]
        to_call = self.current_bet - player.bet_this_round
        if to_call <= 0:
            actions.append(PlayerAction.CHECK)
        elif player.chips >= to_call:
            actions.append(PlayerAction.CALL)
        if player.chips > to_call:
            actions.append(PlayerAction.RAISE)
        if player.chips > 0:
            actions.append(PlayerAction.ALL_IN)
        return actions

    def get_call_amount(self, player: Player) -> int:
        return min(self.current_bet - player.bet_this_round, player.chips)

    def get_min_raise_to(self, player: Player) -> int:
        return self.current_bet + self.min_raise

    def process_action(self, player: Player, action: PlayerAction, raise_to: int = 0) -> bool:
        """Process action. Returns True if betting round is over."""
        pidx = self.players.index(player)

        if action == PlayerAction.FOLD:
            player.folded = True
            self.log(f"  {player.name}: 弃牌")
            self._acted_this_round.add(player.name)

        elif action == PlayerAction.CHECK:
            self.log(f"  {player.name}: 过牌")
            self._acted_this_round.add(player.name)

        elif action == PlayerAction.CALL:
            to_call = self.current_bet - player.bet_this_round
            paid = player.place_bet(to_call)
            self.pot += paid
            self.log(f"  {player.name}: 跟注 {paid} → 底池 {self.pot}")
            self._acted_this_round.add(player.name)

        elif action == PlayerAction.RAISE:
            to_raise_to = max(raise_to, self.current_bet + self.min_raise)
            to_pay = to_raise_to - player.bet_this_round
            paid = player.place_bet(to_pay)
            self.pot += paid
            actual_new_bet = player.bet_this_round
            self.min_raise = actual_new_bet - self.current_bet
            self.current_bet = actual_new_bet
            self.last_raiser_idx = pidx
            self.betting_round_start_idx = pidx
            self.log(f"  {player.name}: 加注至 {self.current_bet} → 底池 {self.pot}")
            # Everyone else needs to act again after a raise
            self._acted_this_round = {player.name}

        elif action == PlayerAction.ALL_IN:
            # Cap all-in at the max total bet any active (non-folded) opponent
            # can match. You can't win more from each player than they have.
            opponents = [p for p in self.players if p is not player and not p.folded]
            if opponents:
                # Max chips an opponent could contribute to this pot:
                # their chips already bet this round + chips they still have
                max_opp_total = max(p.bet_this_round + p.chips for p in opponents)
                # Cap how much we put in total this round
                capped_total_bet = min(player.chips + player.bet_this_round,
                                       max_opp_total)
                to_pay = max(0, capped_total_bet - player.bet_this_round)
            else:
                to_pay = player.chips   # no opponents, bet everything

            paid = player.place_bet(to_pay)
            self.pot += paid
            if player.bet_this_round > self.current_bet:
                self.min_raise = player.bet_this_round - self.current_bet
                self.current_bet = player.bet_this_round
                self.last_raiser_idx = pidx
                self.betting_round_start_idx = pidx
                self._acted_this_round = {player.name}
            else:
                self._acted_this_round.add(player.name)
            self.log(f"  {player.name}: 全押! 投入 {paid} → 底池 {self.pot}")

        # Check immediate win (only 1 left)
        active = self.active_players()
        if len(active) == 1:
            self._award_pot(active)
            self.phase = GamePhase.ROUND_END
            return True

        return self._is_betting_over()

    def _is_betting_over(self) -> bool:
        acting = [p for p in self.players if not p.folded and not p.all_in]
        if not acting:
            return True
        # Every active player must have acted AND matched the current bet
        for p in acting:
            if p.bet_this_round < self.current_bet:
                return False
            if p.name not in self._acted_this_round:
                return False
        return True

    def next_active_player(self) -> Optional[Player]:
        """Advance to next player who needs to act.
        A player needs to act if they haven't acted yet this round,
        OR someone raised after them (their bet is now behind).
        """
        n = len(self.players)
        for offset in range(1, n + 1):
            idx = (self.active_player_idx + offset) % n
            p = self.players[idx]
            if p.folded or p.all_in:
                continue
            needs_to_act = (
                p.bet_this_round < self.current_bet or
                p.name not in self._acted_this_round
            )
            if needs_to_act:
                self.active_player_idx = idx
                return p
        return None

    def advance_to_next_street(self):
        """Move to next street or showdown."""
        phase_order = [
            GamePhase.STREET_2,
            GamePhase.STREET_3,
            GamePhase.STREET_4,
            GamePhase.STREET_5,
        ]
        if self.phase in phase_order:
            idx = phase_order.index(self.phase)
            if idx + 1 < len(phase_order):
                self.phase = phase_order[idx + 1]
                self._start_betting_street()
            else:
                self.do_showdown()
        elif self.phase == GamePhase.DEAL_HOLE:
            self.phase = GamePhase.STREET_2
            self._start_betting_street()

    def do_showdown(self):
        self.phase = GamePhase.SHOWDOWN
        active = self.active_players()

        for p in active:
            for c in p.cards:
                c.face_up = True

        if not active:
            self.phase = GamePhase.ROUND_END
            return

        best_rank, best_vals = None, None
        winners = []
        for p in active:
            rank, vals, hname = evaluate_hand(p.cards)
            if best_rank is None or rank > best_rank or (rank == best_rank and vals > best_vals):
                best_rank, best_vals = rank, vals
                winners = [p]
                best_hname = hname
            elif rank == best_rank and vals == best_vals:
                winners.append(p)

        self.log(f"--- 摊牌 ---")
        for p in active:
            r, v, hn = evaluate_hand(p.cards)
            cards_str = ' '.join(str(c) for c in p.cards)
            self.log(f"  {p.name}: [{cards_str}] → {hn}")

        self._award_pot(winners)
        self.phase = GamePhase.ROUND_END

    def _award_pot(self, winners: List[Player]):
        if not winners:
            return
        share = self.pot // len(winners)
        rem = self.pot % len(winners)
        for p in winners:
            p.chips += share
        winners[0].chips += rem
        self.winners = winners
        total = self.pot
        self.pot = 0
        if len(winners) == 1:
            _, _, hn = evaluate_hand(winners[0].cards)
            self.log(f"🏆 {winners[0].name} 赢得 {total} 筹码! ({hn})")
        else:
            names = ' & '.join(p.name for p in winners)
            self.log(f"🤝 平局! {names} 各得 {share} 筹码")