import random
from engine import PokerEngine


class AIAgent:
    def __init__(self, name, aggression=0.5, bluff_frequency=0.2):
        self.name = name
        # aggression: 越大越倾向于加注/梭哈
        self.aggression = max(0.0, float(aggression))
        # bluff_frequency: 基线诈唬概率
        self.bluff_frequency = max(0.0, float(bluff_frequency))
        self.wins = 0  # 记录胜场

    def set_params(self, agg, bluff):
        self.aggression = max(0.0, float(agg))
        self.bluff_frequency = max(0.0, float(bluff))

    def decide(self, hand, pot, wallet, current_max_bet, total_players):
        """
        返回 (action, amt)
        - action: one of 'fold','call','raise'
        - amt: 当 action=='raise' 时，表示希望在当前最高注上额外增加的金额（主逻辑会把它作为 delta 加到 current_max_bet 上）

        增强点：根据牌力、轮次（由手牌张数）、底池大小与对手余额来决定更激进的下注尺度。
        """
        score, ranks = PokerEngine.evaluate_hand(hand)
        # 牌力强度 0..1
        strength = max(0.0, min(1.0, score / 8.0))
        num_cards = len(hand)

        # 当前需要跟的筹码比率（相对于 AI 自己的资金）
        risk_ratio = current_max_bet / (wallet + 1)

        # Pot-relative 倍数，用来决定下注大小
        pot_factor = pot / (wallet + 1)

        # 若无人下注（current_max_bet==0），AI 可选择做开局下注
        if current_max_bet == 0:
            # 强牌时开大注，中等牌小额试探，弱牌可能小幅诈唬
            if strength >= 0.6:
                # 强牌直接大幅加注或梭哈
                amt = int(wallet * (0.6 + 0.3 * self.aggression))
                return "raise", max(10, min(amt, wallet))
            elif strength >= 0.3:
                # 中等牌，按底池比例下注
                base = int(max(20, pot * (0.25 + 0.5 * self.aggression)))
                return "raise", min(base, wallet)
            else:
                # 低牌，偶尔小额偷盲
                if random.random() < self.bluff_frequency * (0.5 + 0.5 * self.aggression):
                    return "raise", min(int(max(10, pot * 0.4)), wallet)
                return "call", 0

        # 如果当前已经有下注，基于牌力和风险来处理
        # 非常强的牌：在任何轮次都倾向于很大额下注或梭哈
        if strength >= 0.6:
            if num_cards >= 4:
                # 后轮强牌更倾向于梭哈
                amt = int(wallet * (0.7 + 0.25 * self.aggression))
            else:
                amt = int(pot * (0.6 + 0.6 * self.aggression))
            return "raise", max(10, min(amt, wallet))

        # 中等牌（如小对或两对潜力）
        if strength >= 0.35:
            # 如果面对的风险不高，可能小加注以扩大底池；若风险高则跟注
            if risk_ratio < 0.4 or random.random() < self.aggression:
                amt = int(pot * (0.25 + 0.5 * self.aggression))
                return "raise", max(10, min(amt, wallet))
            else:
                return "call", 0

        # 弱牌区域：根据底池大小和诈唬倾向决定是否诈唬
        # 底池极大且 AI 有一定 aggression 时更可能诈唬
        bluff_chance = self.bluff_frequency * (0.6 + 0.8 * self.aggression) * (1.0 + pot_factor)
        if random.random() < bluff_chance and pot > 0:
            # 诈唬量与余额相关，可能是一次性较大压制
            amt = int(wallet * (0.35 + 0.5 * self.aggression))
            return "raise", max(10, min(amt, wallet))

        # 若对手下注占比较大且自己牌弱，倾向弃牌
        if risk_ratio > 0.6 and strength < 0.25:
            return "fold", 0

        # 默认跟注（或 check，如果没有需要跟的量）
        return "call", 0