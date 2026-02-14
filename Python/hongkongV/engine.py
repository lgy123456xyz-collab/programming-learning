import random
from collections import Counter

RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
SUITS = ['♠', '♥', '♣', '♦']
RANK_MAP = {r: i for i, r in enumerate(RANKS)}

class PokerEngine:
    @staticmethod
    def get_deck():
        return [(r, s) for r in RANKS for s in SUITS]

    @staticmethod
    def evaluate_hand(hand):
        if len(hand) < 2: return (0, [0])
        ranks = sorted([RANK_MAP[card[0]] for card in hand], reverse=True)
        suits = [card[1] for card in hand]
        counts = Counter(ranks)
        sorted_counts = sorted(counts.items(), key=lambda x: (x[1], x[0]), reverse=True)
        distinct_ranks = [item[0] for item in sorted_counts]
        freqs = [item[1] for item in sorted_counts]
        
        is_flush = len(set(suits)) == 1 and len(hand) == 5
        is_straight = len(counts) == 5 and (max(ranks) - min(ranks) == 4)
        
        # 返回 (等级, 权重排序)
        if is_flush and is_straight: return (8, distinct_ranks)
        if freqs == [4, 1]: return (7, distinct_ranks)
        if freqs == [3, 2]: return (6, distinct_ranks)
        if is_flush: return (5, distinct_ranks)
        if is_straight: return (4, distinct_ranks)
        if freqs == [3, 1, 1]: return (3, distinct_ranks)
        if freqs == [2, 2, 1]: return (2, distinct_ranks)
        if freqs == [2, 1, 1, 1]: return (1, distinct_ranks)
        return (0, distinct_ranks)