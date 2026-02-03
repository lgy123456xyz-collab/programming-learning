import random
from engine import PokerEngine

class AIAgent:
    def __init__(self, name, aggression=0.5, bluff_frequency=0.2):
        self.name = name
        self.aggression = aggression
        self.bluff_frequency = bluff_frequency
        self.wins = 0  # 记录胜场

    def set_params(self, agg, bluff):
        self.aggression = agg
        self.bluff_frequency = bluff

    def decide(self, hand, pot, wallet, current_max_bet, total_players):
        score, ranks = PokerEngine.evaluate_hand(hand)
        strength = score / 8.0
        num_cards = len(hand)
        
        # 计算风险：对方的下注占我多少比例
        call_amount = current_max_bet
        risk_ratio = call_amount / (wallet + 1)

        # --- 激进策略逻辑 ---

        # 1. 强牌大力价值注 (对子以上且轮次靠后)
        if strength >= 0.15: # 哪怕只有一个对子
            # 如果 AI 觉得牌不错，它会下注底池的 50% 到 100%
            bet_factor = self.aggression * (strength + 0.5)
            raise_amt = int(pot * bet_factor)
            
            # 如果是最后两轮，AI 更有可能直接梭哈一半以上余额
            if num_cards >= 4 and strength >= 0.3:
                raise_amt = int(wallet * 0.6)
            
            return "raise", min(raise_amt, wallet)

        # 2. 强力诈唬 (Bluff)
        # 当 AI 牌很烂，但发现底池已经很大，且触发了诈唬性格
        if strength < 0.1 and random.random() < self.bluff_frequency:
            # 突然发起底池 1.5 倍的重注，试图吓退玩家
            bluff_amt = int(pot * 1.5)
            return "raise", min(bluff_amt, wallet)

        # 3. 面对玩家重注的反应
        if risk_ratio > 0.5: # 玩家下注超过 AI 余额一半
            if strength < 0.2: # 如果 AI 只有高牌或小对子
                return "fold", 0 # 及时止损，学会逃跑
            else:
                return "call", 0 # 硬着头皮跟注

        return "call" if call_amount == 0 else "fold", 0