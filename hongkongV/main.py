import tkinter as tk
from tkinter import messagebox
from engine import PokerEngine
from player import Player
from ai_logic import AIAgent
from gui_components import BetSlider

class MainApp:
    def __init__(self, root):
        self.root = root
        self.root.title("港式五张 - 优化布局版")
        self.root.geometry("1100x700")
        self.root.configure(bg="#073616")
        
        self.engine = PokerEngine()
        self.setup_config()

    def setup_config(self):
        """清空界面并显示人数选择菜单"""
        for widget in self.root.winfo_children():
            widget.destroy()
            
        self.config_frame = tk.Frame(self.root, bg="#073616")
        self.config_frame.place(relx=0.5, rely=0.5, anchor="center")
        
        tk.Label(self.config_frame, text="梭哈 · 多人对战", font=("微软雅黑", 32, "bold"), bg="#073616", fg="white").pack(pady=40)
        
        btn_container = tk.Frame(self.config_frame, bg="#073616")
        btn_container.pack()
        
        for i in range(2, 6):
            tk.Button(btn_container, text=f"{i} 人模式", font=("微软雅黑", 12), width=10, height=2,
                      command=lambda n=i: self.start_game(n)).pack(side="left", padx=15)

    def start_game(self, n):
        self.config_frame.destroy()
        # 初始化玩家数据
        self.players = [Player(0, "你", True)] + [Player(i, f"AI-{i}") for i in range(1, n)]
        # 使用训练出来的最佳数值，这个 AI 会变得极其难缠
        self.ai_brain = AIAgent("经过训练的AI", aggression=0.768431557572415, bluff_frequency=0.40041195019017334)
        self.pot = 0
        self.round_num = 2
        self.current_max_bet = 0
        
        self.init_ui()
        self.new_hand()

    def init_ui(self):
        # 1. 顶部状态条
        self.header = tk.Frame(self.root, bg="#052610", height=60)
        self.header.pack(fill="x", side="top")
        
        tk.Button(self.header, text="← 返回菜单", bg="#c0392b", fg="white", relief="flat",
                  command=self.setup_config).pack(side="left", padx=20, pady=10)
        
        self.pot_label = tk.Label(self.header, text="底池: $0", font=("微软雅黑", 20, "bold"), bg="#052610", fg="yellow")
        self.pot_label.pack(side="right", padx=30)

        # 2. 中间牌桌区 (固定玩家框架高度)
        self.table_area = tk.Frame(self.root, bg="#073616")
        self.table_area.pack(fill="both", expand=True, pady=20)
        
        self.ui_players = []
        for p in self.players:
            # 关键改进：固定宽度(200)和高度(250)，防止过度拉伸
            f = tk.LabelFrame(self.table_area, text=p.name, bg="#0a2614", fg="#55efc4", 
                              font=("微软雅黑", 12, "bold"), width=200, height=250)
            f.pack_propagate(False) # 强制固定大小
            f.pack(side="left", padx=10, pady=10, anchor="n")
            
            l = tk.Label(f, text="", font=("Segoe UI Symbol", 20), bg="#0a2614", fg="white", wraplength=180)
            l.pack(expand=True)
            
            w = tk.Label(f, text=f"${p.wallet}", font=("Consolas", 14), bg="#0a2614", fg="#f1c40f")
            w.pack(side="bottom", pady=10)
            
            self.ui_players.append({"cards": l, "wallet": w, "frame": f})

        # 3. 底部控制区
        self.ctrl = tk.Frame(self.root, bg="#111", height=120)
        self.ctrl.pack(fill="x", side="bottom")
        
        self.slider = BetSlider(self.ctrl, None)
        self.slider.pack(side="left", padx=30, pady=20)
        
        # 按钮样式统一
        btn_style = {"font": ("微软雅黑", 10, "bold"), "width": 12, "height": 2, "relief": "flat"}
        
        tk.Button(self.ctrl, text="跟注/过牌", bg="#2980b9", fg="white", **btn_style,
                  command=self.handle_call).pack(side="left", padx=10)
        tk.Button(self.ctrl, text="确认加注", bg="#27ae60", fg="white", **btn_style,
                  command=self.handle_raise).pack(side="left", padx=10)
        tk.Button(self.ctrl, text="放弃 (Fold)", bg="#7f8c8d", fg="white", **btn_style,
                  command=self.handle_fold).pack(side="left", padx=10)

    def new_hand(self):
        # 破产检查
        if self.players[0].wallet <= 0:
            messagebox.showinfo("结束", "你已经破产了！")
            self.setup_config()
            return

        self.deck = self.engine.get_deck()
        import random; random.shuffle(self.deck)
        self.pot = 0
        self.round_num = 2
        self.current_max_bet = 0
        
        for p in self.players:
            p.reset_hand()
            p.wallet -= 50; self.pot += 50
            p.hand = [self.deck.pop(), self.deck.pop()]
        
        # 自动同步滑动条上限为玩家余额
        self.slider.set_max(self.players[0].wallet)
        self.update_view()

    def update_view(self, show_all=False):
        self.pot_label.config(text=f"底池: ${self.pot}")
        for i, p in enumerate(self.players):
            if not p.is_active:
                self.ui_players[i]["cards"].config(text="FOLDED", fg="#636e72")
                self.ui_players[i]["frame"].config(fg="#636e72")
                continue
            
            txt = ""
            for j, c in enumerate(p.hand):
                # 规则：底牌（第0张）只在自己或摊牌时可见
                txt += f"{c[1]}{c[0]} " if (j > 0 or p.is_human or show_all) else "🎴 "
            
            self.ui_players[i]["cards"].config(text=txt, fg="white" if p.is_human else "#dfe6e9")
            self.ui_players[i]["wallet"].config(text=f"${p.wallet}")

    def handle_call(self):
        cost = self.current_max_bet
        if self.players[0].wallet < cost:
            cost = self.players[0].wallet
        
        self.pot += cost
        self.players[0].wallet -= cost
        self.ai_phase()

    def handle_raise(self):
        val = int(self.slider.slider.get())
        if val > self.players[0].wallet: val = self.players[0].wallet
        self.current_max_bet = val
        self.handle_call()

    def handle_fold(self):
        self.players[0].is_active = False
        self.ai_phase()

    def ai_phase(self):
            # 1. 记录本轮是否有人加注，用于循环确认（可选，此处简化为一轮决策）
            active_players = [p for p in self.players if p.is_active]
            
            for p in self.players:
                if not p.is_active or p.is_human:
                    continue
                # 增加随机延时，模拟 AI “思考”重注的过程
                self.root.update()
                
                # 让 AI 进行细腻思考
                move, amt = self.ai_brain.decide(
                    p.hand, 
                    self.pot, 
                    p.wallet, 
                    self.current_max_bet, 
                    len(self.players)
                )
                
                if move == "fold":
                    p.is_active = False
                    # --- 核心改进：即时检查是否全场只剩一人 ---
                    current_actives = [pl for pl in self.players if pl.is_active]
                    if len(current_actives) == 1:
                        self.update_view()
                        winner = current_actives[0]
                        messagebox.showinfo("胜利", f"其他玩家全部弃牌，{winner.name} 赢得 ${self.pot}！")
                        winner.wallet += self.pot
                        self.new_hand()
                        return # 立即跳出，不进行后续 AI 决策和发牌
                
                if move == "raise":
                    # 当 AI 选择加注时，更新当前全场最高注
                    self.current_max_bet += amt 
                    p.wallet -= (self.current_max_bet) # AI 投入筹码
                    self.pot += (self.current_max_bet)
                    # 可以在界面提示：AI 大力加注了！
                
                else: # Call or Check
                    call_amt = min(self.current_max_bet, p.wallet)
                    p.wallet -= call_amt
                    self.pot += call_amt

            # 2. 轮次推进逻辑
            if self.round_num < 5:
                self.round_num += 1
                for p in self.players:
                    if p.is_active: p.hand.append(self.deck.pop())
                self.update_view()
            else:
                self.resolve()

    def resolve(self):
        self.update_view(show_all=True)
        active_ps = [p for p in self.players if p.is_active]
        
        if active_ps:
            scores = [self.engine.evaluate_hand(p.hand) for p in active_ps]
            winner = active_ps[scores.index(max(scores))]
            messagebox.showinfo("摊牌结算", f"赢家是: {winner.name}!\n赢取底池: ${self.pot}")
            winner.wallet += self.pot
        
        self.new_hand()

if __name__ == "__main__":
    root = tk.Tk()
    app = MainApp(root)
    root.mainloop()