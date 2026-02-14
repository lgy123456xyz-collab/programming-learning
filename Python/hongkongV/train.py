import random
from engine import PokerEngine
from player import Player
from ai_logic import AIAgent

def simulate_game(ai1, ai2, rounds=1000):
    engine = PokerEngine()
    ai1_win_count = 0
    ai2_win_count = 0

    for _ in range(rounds):
        deck = engine.get_deck()
        random.shuffle(deck)
        
        # 创建虚拟对局
        p1 = Player(1, "AI-Alpha")
        p2 = Player(2, "AI-Beta")
        p1.hand = [deck.pop(), deck.pop()]
        p2.hand = [deck.pop(), deck.pop()]
        
        pot = 100 # 初始底池
        current_max_bet = 0
        
        # 模拟 3-5 张牌的过程
        for r in range(3, 6):
            # AI-1 决策
            m1, a1 = ai1.decide(p1.hand, pot, p1.wallet, current_max_bet, 2)
            if m1 == "fold": 
                ai2_win_count += 1
                break
            
            # AI-2 决策
            m2, a2 = ai2.decide(p2.hand, pot, p2.wallet, current_max_bet, 2)
            if m2 == "fold":
                ai1_win_count += 1
                break
                
            # 发下一张牌
            p1.hand.append(deck.pop())
            p2.hand.append(deck.pop())
            
            if r == 5: # 最终摊牌
                s1 = engine.evaluate_hand(p1.hand)
                s2 = engine.evaluate_hand(p2.hand)
                if s1 > s2: ai1_win_count += 1
                else: ai2_win_count += 1
                
    return ai1_win_count, ai2_win_count

# 开始演化训练
print("开始 AI 演化训练...")
best_agg, best_bluff = 0.5, 0.2
max_wins = 0

for i in range(20): # 进行 20 代演化
    test_agg = random.uniform(0.1, 1.5)
    test_bluff = random.uniform(0.0, 0.5)
    
    agent_fixed = AIAgent("Baseline", best_agg, best_bluff)
    agent_test = AIAgent("Challenger", test_agg, test_bluff)
    
    w1, w2 = simulate_game(agent_fixed, agent_test, 500)
    
    print(f"第 {i+1} 代: 挑战者(Agg:{test_agg:.2f}) 胜率: {w2/500:.2%}")
    
    if w2 > w1:
        best_agg, best_bluff = test_agg, test_bluff
        max_wins = w2
        print(f"发现更强参数! 新基准 -> Agg:{best_agg:.2f}, Bluff:{best_bluff:.2f}")

print("-" * 30)
print(f"训练完成! 最优 AI 参数: Aggression={best_agg}, Bluff={best_bluff}")