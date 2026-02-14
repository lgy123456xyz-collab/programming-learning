from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QLabel, QMessageBox, QFrame, QSizePolicy
)
from PyQt6.QtCore import Qt
import random

from engine import PokerEngine
from player import Player
from ai_logic import AIAgent
from gui_components import BetSlider


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("港式五张 - PyQt6 版")
        self.setFixedSize(1100, 700)
        self.setStyleSheet("background: #073616;")

        self.engine = PokerEngine()

        self.central = QWidget()
        self.setCentralWidget(self.central)
        self.vlayout = QVBoxLayout(self.central)

        self.setup_config()

    def setup_config(self):
        # 清空布局
        for i in reversed(range(self.vlayout.count())):
            w = self.vlayout.itemAt(i).widget()
            if w:
                w.setParent(None)

        cfg = QWidget()
        cfg_layout = QVBoxLayout(cfg)
        title = QLabel("梭哈 · 多人对战")
        title.setStyleSheet("color:white; font-size:32px; font-weight:bold;")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        cfg_layout.addStretch()
        cfg_layout.addWidget(title)

        btn_container = QHBoxLayout()
        for i in range(2, 6):
            b = QPushButton(f"{i} 人模式")
            b.setFixedSize(120, 50)
            b.clicked.connect(lambda _, n=i: self.start_game(n))
            btn_container.addWidget(b)

        cfg_layout.addLayout(btn_container)
        cfg_layout.addStretch()
        self.vlayout.addWidget(cfg)

    def start_game(self, n):
        # 初始化玩家数据
        self.players = [Player(0, "你", True)] + [Player(i, f"AI-{i}") for i in range(1, n)]
        self.ai_brain = AIAgent("经过训练的AI", aggression=0.768431557572415, bluff_frequency=0.40041195019017334)
        self.pot = 0
        self.round_num = 2
        self.current_max_bet = 0

        self.init_ui()
        self.new_hand()

    def init_ui(self):
        # 顶部状态条
        header = QFrame()
        header.setStyleSheet("background:#052610;")
        header.setFixedHeight(60)
        h_layout = QHBoxLayout(header)

        back_btn = QPushButton("← 返回菜单")
        back_btn.setStyleSheet("background:#d35400; color:white; padding:6px; border-radius:6px;")
        back_btn.clicked.connect(self.setup_config)
        h_layout.addWidget(back_btn, alignment=Qt.AlignmentFlag.AlignLeft)

        self.pot_label = QLabel("底池: $0")
        self.pot_label.setStyleSheet("color: #ffd86b; font-size:18px; font-weight:bold;")
        h_layout.addWidget(self.pot_label, alignment=Qt.AlignmentFlag.AlignRight)

        self.vlayout.addWidget(header)

        # 中间牌桌区
        self.table_area = QFrame()
        self.table_area.setStyleSheet("background:#073616;")
        self.table_layout = QHBoxLayout(self.table_area)
        self.table_layout.setSpacing(10)
        self.vlayout.addWidget(self.table_area, stretch=1)

        self.ui_players = []
        for p in self.players:
            f = QFrame()
            f.setStyleSheet("background:#0b3020; color:#a7f3d0; border-radius:6px;")
            f.setFixedSize(200, 250)
            fl = QVBoxLayout(f)
            name = QLabel(p.name)
            name.setStyleSheet("color:#a7f3d0; font-weight:bold;")
            name.setAlignment(Qt.AlignmentFlag.AlignCenter)
            fl.addWidget(name)

            cards = QLabel("")
            cards.setStyleSheet("color: white; font-size:18px;")
            cards.setWordWrap(True)
            cards.setAlignment(Qt.AlignmentFlag.AlignCenter)
            fl.addWidget(cards, stretch=1)

            wallet = QLabel(f"${p.wallet}")
            wallet.setStyleSheet("color:#ffd86b; font-weight:bold;")
            wallet.setAlignment(Qt.AlignmentFlag.AlignCenter)
            fl.addWidget(wallet)

            self.table_layout.addWidget(f)
            self.ui_players.append({"cards": cards, "wallet": wallet, "frame": f})

        # 底部控制区
        ctrl = QFrame()
        ctrl.setStyleSheet("background:#0e1112;")
        ctrl.setFixedHeight(120)
        c_layout = QHBoxLayout(ctrl)

        self.slider = BetSlider()
        c_layout.addWidget(self.slider)

        call_btn = QPushButton("跟注/过牌")
        call_btn.setStyleSheet("background:#2d7fb3; color:white; padding:8px; border-radius:6px;")
        call_btn.clicked.connect(self.handle_call)
        c_layout.addWidget(call_btn)

        raise_btn = QPushButton("确认加注")
        raise_btn.setStyleSheet("background:#1fa65a; color:white; padding:8px; border-radius:6px;")
        raise_btn.clicked.connect(self.handle_raise)
        c_layout.addWidget(raise_btn)

        fold_btn = QPushButton("放弃 (Fold)")
        fold_btn.setStyleSheet("background:#6c7a81; color:white; padding:8px; border-radius:6px;")
        fold_btn.clicked.connect(self.handle_fold)
        c_layout.addWidget(fold_btn)

        self.vlayout.addWidget(ctrl)

    def new_hand(self):
        if self.players[0].wallet <= 0:
            QMessageBox.information(self, "结束", "你已经破产了！")
            self.setup_config()
            return

        self.deck = self.engine.get_deck()
        random.shuffle(self.deck)
        self.pot = 0
        self.round_num = 2
        # 先收 ante，每位玩家放底注 50，作为本轮初始已投注
        self.current_max_bet = 50

        for p in self.players:
            p.reset_hand()
            p.wallet -= 50
            p.current_bet = 50
            self.pot += 50
            p.hand = [self.deck.pop(), self.deck.pop()]

        self.slider.set_max(self.players[0].wallet)
        self.update_view()

    def update_view(self, show_all=False):
        self.pot_label.setText(f"底池: ${self.pot}")
        for i, p in enumerate(self.players):
            if not p.is_active:
                self.ui_players[i]["cards"].setText("FOLDED")
                self.ui_players[i]["cards"].setStyleSheet("color:#636e72;")
                continue

            txt = ""
            for j, c in enumerate(p.hand):
                txt += f"{c[1]}{c[0]} " if (j > 0 or p.is_human or show_all) else "🎴 "

            color = "white" if p.is_human else "#dfe6e9"
            self.ui_players[i]["cards"].setText(txt)
            self.ui_players[i]["cards"].setStyleSheet(f"color:{color}; font-size:18px;")
            self.ui_players[i]["wallet"].setText(f"${p.wallet}")

    def handle_call(self):
        player = self.players[0]
        # 本轮需要补齐的金额为 当前最大注 - 自己已投
        need = max(0, self.current_max_bet - player.current_bet)
        pay = min(need, player.wallet)
        player.wallet -= pay
        player.current_bet += pay
        self.pot += pay
        self.ai_phase()

    def handle_raise(self):
        player = self.players[0]
        add = int(self.slider.value())
        # 将加注理解为在当前最高注上增加 add
        desired = self.current_max_bet + add
        to_put = max(0, desired - player.current_bet)
        to_put = min(to_put, player.wallet)
        player.wallet -= to_put
        player.current_bet += to_put
        self.pot += to_put
        # 更新全场最高注
        if player.current_bet > self.current_max_bet:
            self.current_max_bet = player.current_bet
        self.ai_phase()

    def handle_fold(self):
        self.players[0].is_active = False
        self.ai_phase()

    def ai_phase(self):
        for p in self.players:
            if not p.is_active or p.is_human:
                continue

            QApplication.processEvents()
            move, amt = self.ai_brain.decide(p.hand, self.pot, p.wallet, self.current_max_bet, len(self.players))

            if move == "fold":
                p.is_active = False
                current_actives = [pl for pl in self.players if pl.is_active]
                if len(current_actives) == 1:
                    self.update_view()
                    winner = current_actives[0]
                    QMessageBox.information(self, "胜利", f"其他玩家全部弃牌，{winner.name} 赢得 ${self.pot}！")
                    winner.wallet += self.pot
                    self.new_hand()
                    return

            elif move == "raise":
                # AI 返回的 amt 解释为想要额外加注的金额（在当前最高注上增加 amt）
                desired = self.current_max_bet + amt
                to_put = max(0, desired - p.current_bet)
                to_put = min(to_put, p.wallet)
                p.wallet -= to_put
                p.current_bet += to_put
                self.pot += to_put
                if p.current_bet > self.current_max_bet:
                    self.current_max_bet = p.current_bet

            else:  # call or check
                call_amt = max(0, self.current_max_bet - p.current_bet)
                call_amt = min(call_amt, p.wallet)
                p.wallet -= call_amt
                p.current_bet += call_amt
                self.pot += call_amt

        if self.round_num < 5:
            # 结束本轮投注，清空各人本轮已投注，为下一轮重新开始
            for pl in self.players:
                pl.current_bet = 0
            self.current_max_bet = 0

            self.round_num += 1
            for p in self.players:
                if p.is_active:
                    p.hand.append(self.deck.pop())
            self.update_view()
        else:
            self.resolve()

    def resolve(self):
        self.update_view(show_all=True)
        active_ps = [p for p in self.players if p.is_active]
        if active_ps:
            scores = [self.engine.evaluate_hand(p.hand) for p in active_ps]
            winner = active_ps[scores.index(max(scores))]
            QMessageBox.information(self, "摊牌结算", f"赢家是: {winner.name}!\n赢取底池: ${self.pot}")
            winner.wallet += self.pot

        self.new_hand()


if __name__ == "__main__":
    import sys
    app = QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec())