"""
港式梭哈 - PyQt5 图形界面 (完整版 v2.0)
新增功能:
  - 原生菜单栏 (文件/视图/游戏/帮助)
  - 设置对话框: 分辨率预设、UI缩放、AI速度、HUD开关、快捷键提示
  - 全屏切换 (F11)
  - 存档/读档系统 (Ctrl+S / Ctrl+O)
  - 排行榜 (历史最佳成绩本地记录)
  - 游戏内HUD: 胜率条 + 底池赔率 + EV判断
  - 键盘快捷键: F/C/R/A/Space/N
  - 上次配置记忆
"""

import sys, os, json, math, random
from typing import List, Optional, Dict
from datetime import datetime

from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QGridLayout, QPushButton, QLabel, QFrame, QDialog, QSlider,
    QSpinBox, QComboBox, QProgressBar, QMessageBox, QGroupBox,
    QStackedWidget, QTextEdit, QTabWidget, QTableWidget,
    QTableWidgetItem, QHeaderView, QLineEdit, QCheckBox,
    QAction, QMenu, QShortcut
)
from PyQt5.QtCore import Qt, QTimer, QThread, pyqtSignal, QPoint, pyqtSlot, QUrl
from PyQt5.QtGui import (
    QPainter, QColor, QFont, QFontMetrics, QFontDatabase, QPalette,
    QLinearGradient, QRadialGradient, QPen, QBrush, QKeySequence
)

from game_engine import (
    Card, Player, PlayerAction, HandRank, GamePhase, HAND_NAMES,
    evaluate_hand, HKStudGame, PHASE_NAMES, ACTION_NAMES
)
from ai_player import AIPlayer, self_play_training, quick_hand_strength


# ─── Sound System ─────────────────────────────────────────────────────────────

import struct, wave as _wave, tempfile, math as _math

try:
    from PyQt5.QtMultimedia import QSoundEffect as _QSoundEffect
    _AUDIO_AVAILABLE = True
except ImportError:
    _AUDIO_AVAILABLE = False

_SFX: dict = {}   # name → QSoundEffect (or None if unavailable)

def _make_wav(path: str, freq: float, duration: float,
              volume: float = 0.55, shape: str = 'sine', fade_out: float = 0.3):
    rate = 44100; n = int(rate * duration); fade = int(rate * fade_out)
    frames = []
    for i in range(n):
        t = i / rate
        if shape == 'sine':    v = _math.sin(2*_math.pi*freq*t)
        elif shape == 'square': v = 1.0 if _math.sin(2*_math.pi*freq*t) >= 0 else -1.0
        elif shape == 'tri':   v = 2*abs(2*(t*freq-_math.floor(t*freq+0.5)))-1
        else:                  v = _math.sin(2*_math.pi*freq*t)
        env = min(1.0, (n-i)/max(fade, 1))
        atk = min(1.0, i/max(int(rate*0.005), 1))
        sample = int(v*env*atk*volume*32767)
        frames.append(struct.pack('<h', max(-32767, min(32767, sample))))
    with _wave.open(path, 'w') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(rate)
        wf.writeframes(b''.join(frames))

def _chord_wav(path: str, freqs, duration, volume=0.45, fade_out=0.35):
    rate = 44100; n = int(rate*duration); fade = int(rate*fade_out)
    frames = []
    for i in range(n):
        t = i/rate
        v = sum(_math.sin(2*_math.pi*f*t) for f in freqs) / len(freqs)
        env = min(1.0, (n-i)/max(fade,1)); atk = min(1.0, i/max(int(rate*0.005),1))
        frames.append(struct.pack('<h', max(-32767, min(32767, int(v*env*atk*volume*32767)))))
    with _wave.open(path,'w') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(rate)
        wf.writeframes(b''.join(frames))

def _two_tone_wav(path, f1, f2, split, duration, volume=0.5, fade_out=0.25):
    rate=44100; n=int(rate*duration); sp=int(rate*split); fade=int(rate*fade_out)
    frames=[]
    for i in range(n):
        t=i/rate; f=f1 if i<sp else f2
        v=_math.sin(2*_math.pi*f*t)
        seg=sp if i<sp else n-sp; pos=i if i<sp else i-sp
        env=min(1.0,(seg-pos)/max(fade,1)); atk=min(1.0,pos/max(int(rate*0.004),1))
        frames.append(struct.pack('<h',max(-32767,min(32767,int(v*env*atk*volume*32767)))))
    with _wave.open(path,'w') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(rate)
        wf.writeframes(b''.join(frames))

# Sound design — each action has a distinct character:
#   fold    : descending dull thud   (you're out)
#   check   : single soft click      (nothing happening)
#   call    : two-tone step up       (staying in)
#   raise   : bright triad arpeggio  (asserting dominance)
#   allin   : big 4-note power chord (all or nothing)
#   win     : rising victory fanfare
#   deal    : crisp high snap        (card hitting table)
#   newround: gentle two-note chime
#   bust    : low descending growl   (bankruptcy)
_SFX_SPECS = [
    ('fold',    lambda p: _make_wav(p,  200, 0.22, 0.38, 'tri',   0.20)),
    ('check',   lambda p: _make_wav(p,  480, 0.08, 0.30, 'sine',  0.07)),
    ('call',    lambda p: _two_tone_wav(p, 440, 560, 0.08, 0.20, 0.42)),
    ('raise',   lambda p: _chord_wav(p, [523, 659, 784],       0.30, 0.52, 0.28)),
    ('allin',   lambda p: _chord_wav(p, [392, 494, 587, 740],  0.50, 0.62, 0.42)),
    ('win',     lambda p: _chord_wav(p, [523, 659, 784, 1047], 0.60, 0.56, 0.50)),
    ('deal',    lambda p: _make_wav(p,  920, 0.06, 0.26, 'sine',  0.05)),
    ('newround',lambda p: _two_tone_wav(p, 330, 495, 0.13, 0.30, 0.32)),
    ('bust',    lambda p: _make_wav(p,  100, 0.45, 0.32, 'tri',   0.42)),
]

def _init_sounds():
    """Generate WAV tones and load into QSoundEffect.  Safe no-op if audio unavailable."""
    global _SFX
    if not _AUDIO_AVAILABLE:
        return
    try:
        td = tempfile.mkdtemp(prefix='hkpoker_sfx_')
        for name, gen in _SFX_SPECS:
            try:
                path = os.path.join(td, f'{name}.wav')
                gen(path)
                sfx = _QSoundEffect()
                sfx.setSource(QUrl.fromLocalFile(path))
                sfx.setVolume(0.72)
                _SFX[name] = sfx
            except Exception:
                pass
    except Exception:
        pass

def play_sfx(name: str):
    sfx = _SFX.get(name)
    if sfx:
        try: sfx.play()
        except Exception: pass


# ─── Persistence helpers ──────────────────────────────────────────────────────

SETTINGS_FILE    = "hkpoker_settings.json"
SAVE_FILE        = "hkpoker_save.json"
LEADERBOARD_FILE = "hkpoker_leaderboard.json"

DEFAULT_SETTINGS = {
    "window_width":  1200,
    "window_height": 850,
    "ui_scale":      1.0,
    "ai_speed":      1200,
    "fullscreen":    False,
    "show_hud":      True,
    "show_hotkeys":  True,
}

def load_settings() -> dict:
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, encoding='utf-8') as f:
                d = json.load(f)
            s = dict(DEFAULT_SETTINGS); s.update(d); return s
        except Exception:
            pass
    return dict(DEFAULT_SETTINGS)

def save_settings(s: dict):
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(s, f, ensure_ascii=False, indent=2)

def load_leaderboard() -> list:
    if os.path.exists(LEADERBOARD_FILE):
        try:
            with open(LEADERBOARD_FILE, encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_leaderboard(lb: list):
    with open(LEADERBOARD_FILE, 'w', encoding='utf-8') as f:
        json.dump(lb[:20], f, ensure_ascii=False, indent=2)

def add_leaderboard_entry(name: str, chips: int, rounds: int, difficulty: str):
    lb = load_leaderboard()
    lb.append({"name": name, "chips": chips, "rounds": rounds,
                "difficulty": difficulty,
                "date": datetime.now().strftime("%Y-%m-%d %H:%M")})
    lb.sort(key=lambda x: x["chips"], reverse=True)
    save_leaderboard(lb)

def load_save() -> Optional[dict]:
    if os.path.exists(SAVE_FILE):
        try:
            with open(SAVE_FILE, encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return None

def write_save(data: dict):
    with open(SAVE_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def delete_save():
    if os.path.exists(SAVE_FILE):
        os.remove(SAVE_FILE)


# ─── Global scale factor ──────────────────────────────────────────────────────

_SCALE = 1.0

def sc(x: float) -> int:
    return max(1, int(x * _SCALE))


# ─── Colors ───────────────────────────────────────────────────────────────────

class C:
    BG_DARK        = '#0a0f1e'
    BG_MED         = '#111827'
    BG_LIGHT       = '#1f2937'
    GOLD           = '#d4af37'
    GOLD_L         = '#f0d060'
    GOLD_D         = '#b8860b'
    RED            = '#c0392b'
    CARD_BG        = '#f8f4e8'
    CARD_DARK      = '#1a1a2e'
    TEXT           = '#f0f0f0'
    TEXT2          = '#9ca3af'
    BORDER         = '#374151'
    BORDER2        = '#4b5563'
    GREEN          = '#16a34a'
    BLUE           = '#2563eb'
    PURPLE         = '#7c3aed'
    DANGER         = '#dc2626'
    HIGHLIGHT      = '#fbbf24'


# ─── Card Widget ──────────────────────────────────────────────────────────────

class CardWidget(QWidget):
    BASE_W, BASE_H = 70, 100

    def __init__(self, card: Optional[Card] = None, small: bool = False,
                 tiny: bool = False, show_face: bool = False, parent=None):
        super().__init__(parent)
        self.card = card
        self.small = small
        self.tiny  = tiny   # extra-small for compact panels
        self.show_face = show_face
        self.highlighted = False
        self.winner = False
        self._do_resize()

    def _do_resize(self):
        if self.tiny:
            s = 0.52 * _SCALE
        elif self.small:
            s = 0.70 * _SCALE
        else:
            s = 1.0 * _SCALE
        self.setFixedSize(int(self.BASE_W * s), int(self.BASE_H * s))

    def set_card(self, card, show_face: bool = False):
        self.card = card; self.show_face = show_face; self.update()

    def set_highlighted(self, h):
        self.highlighted = h; self.update()

    def set_winner(self, w):
        self.winner = w; self.update()

    def paintEvent(self, event):
        p = QPainter(self)
        p.setRenderHint(QPainter.Antialiasing)
        w, h = self.width(), self.height()
        r = max(3, int(w * 0.10))

        # Winner glow
        if self.winner:
            g = QColor('#ffd700'); g.setAlpha(80)
            p.setBrush(QBrush(g)); p.setPen(Qt.NoPen)
            p.drawRoundedRect(-3, -3, w+6, h+6, r+3, r+3)

        # Empty slot
        if self.card is None:
            p.setPen(QPen(QColor(C.BORDER), 1, Qt.DashLine))
            p.setBrush(QBrush(QColor(255,255,255,20)))
            p.drawRoundedRect(0, 0, w, h, r, r)
            return

        # Card back
        if not self.card.face_up and not self.show_face:
            gr = QLinearGradient(0,0,w,h)
            gr.setColorAt(0, QColor('#1a237e'))
            gr.setColorAt(.5, QColor('#283593'))
            gr.setColorAt(1, QColor('#1a237e'))
            p.setBrush(QBrush(gr)); p.setPen(QPen(QColor(C.GOLD), 1.5))
            p.drawRoundedRect(0, 0, w-1, h-1, r, r)
            p.setPen(QPen(QColor(255,255,255,35), .5))
            step = max(6, w//8)
            for i in range(0,w,step): p.drawLine(i,0,i,h)
            for i in range(0,h,step): p.drawLine(0,i,w,i)
            cx, cy, sz = w//2, h//2, min(w,h)//4
            p.setPen(QPen(QColor(C.GOLD), 1)); p.setBrush(Qt.NoBrush)
            p.drawPolygon(QPoint(cx,cy-sz), QPoint(cx+sz,cy),
                          QPoint(cx,cy+sz), QPoint(cx-sz,cy))
            return

        # Card face — white background
        p.setBrush(QBrush(QColor(C.CARD_BG)))
        bc = QColor(C.HIGHLIGHT) if self.highlighted else QColor('#ccc5ad')
        p.setPen(QPen(bc, 2 if self.highlighted else 1))
        p.drawRoundedRect(0, 0, w-1, h-1, r, r)

        tc = QColor(C.RED) if self.card.is_red else QColor(C.CARD_DARK)
        rank, suit = self.card.rank, self.card.suit

        # ── Corner font size: relative to card width, always readable ──────
        # Target: rank text ≈ 28% of card width, minimum 8px
        corner_fs = max(8, int(w * 0.28))
        suit_fs   = max(7, int(w * 0.22))
        center_fs = max(10, int(min(w, h) * 0.42))

        f_rank   = QFont('', corner_fs, QFont.Bold)
        f_suit_c = QFont('', suit_fs)
        f_center = QFont('', center_fs, QFont.Bold)

        fm_rank   = QFontMetrics(f_rank)
        fm_suit_c = QFontMetrics(f_suit_c)
        fm_center = QFontMetrics(f_center)

        # Padding from card edge (inward enough to clear border-radius)
        pad = max(3, int(w * 0.13))

        p.setPen(QPen(tc))

        # ── Top-left corner: rank then suit below ───────────────────────────
        rank_y = pad + fm_rank.ascent()
        p.setFont(f_rank)
        p.drawText(pad, rank_y, rank)

        suit_y = rank_y + fm_rank.descent() + fm_suit_c.ascent() + 1
        p.setFont(f_suit_c)
        p.drawText(pad, suit_y, suit)

        # ── Centre: large suit symbol only ──────────────────────────────────
        p.setFont(f_center)
        cx = (w - fm_center.horizontalAdvance(suit)) // 2
        cy = (h - fm_center.height()) // 2 + fm_center.ascent()
        p.drawText(cx, cy, suit)

        # ── Bottom-right corner: rotate 180°, same layout ───────────────────
        p.save()
        p.translate(w, h)
        p.rotate(180)
        p.setFont(f_rank)
        p.drawText(pad, rank_y, rank)
        p.setFont(f_suit_c)
        p.drawText(pad, suit_y, suit)
        p.restore()


# ─── Chip Label ───────────────────────────────────────────────────────────────

class ChipLabel(QLabel):
    def __init__(self, amount=0, compact=False, parent=None):
        super().__init__(parent)
        self.amount = amount
        self.compact = compact
        self.setAlignment(Qt.AlignCenter); self._r()

    def set_amount(self, amount):
        self.amount = amount; self._r()

    def _r(self):
        col = C.GOLD if self.amount > 0 else '#6b7280'
        self.setText(f"💰 {self.amount:,}")
        fs  = sc(10 if self.compact else 12)
        pad = sc(2 if self.compact else 3)
        self.setStyleSheet(f"QLabel {{ color:{col}; font-size:{fs}px; font-weight:bold; padding:{pad}px {sc(7)}px; min-height:{sc(18 if self.compact else 22)}px; background:rgba(0,0,0,.3); border-radius:{sc(7)}px; border:1px solid {col}88; }}")


# ─── HUD Widget ───────────────────────────────────────────────────────────────

class HUDWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.win_pct = 0.0; self.pot_odds = 0.0; self.hand_name = ''
        self.setMinimumHeight(sc(44))
        self.setFixedHeight(sc(44))

    def update_info(self, win_pct, pot_odds, hand_name):
        self.win_pct = win_pct; self.pot_odds = pot_odds; self.hand_name = hand_name
        self.update()

    def paintEvent(self, event):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        w, h = self.width(), self.height()

        p.setBrush(QBrush(QColor(0,0,0,150))); p.setPen(QPen(QColor(C.BORDER), 1))
        p.drawRoundedRect(0, 0, w-1, h-1, 7, 7)

        label_w  = sc(36)   # "胜率" label zone
        bar_x    = label_w + sc(4)
        bar_w_max = w - bar_x - sc(175)
        bar_h    = sc(9)
        bar_y    = (h - bar_h) // 2
        bar_fill = int(bar_w_max * max(0.0, min(1.0, self.win_pct)))

        bc = QColor(C.GREEN) if self.win_pct > .5 else (QColor(C.GOLD) if self.win_pct > .3 else QColor(C.DANGER))

        # Bar background
        p.setBrush(QBrush(QColor(255,255,255,20))); p.setPen(Qt.NoPen)
        p.drawRoundedRect(bar_x, bar_y, max(bar_w_max, 0), bar_h, 3, 3)
        # Bar fill
        if bar_fill > 0:
            p.setBrush(QBrush(bc)); p.drawRoundedRect(bar_x, bar_y, bar_fill, bar_h, 3, 3)

        f = QFont('Microsoft YaHei', max(8, sc(9))); p.setFont(f)

        # Left: label + pct
        p.setPen(QPen(QColor(C.TEXT2))); p.drawText(sc(6), bar_y - sc(1), "胜率")
        p.setPen(QPen(bc));              p.drawText(sc(6), bar_y + bar_h + sc(11), f"{self.win_pct*100:.0f}%")

        # Right: pot odds + EV + hand
        rx = w - sc(170)
        p.setPen(QPen(QColor(C.TEXT2))); p.drawText(rx, bar_y, f"底池赔率: {self.pot_odds*100:.0f}%")
        ev_ok = self.win_pct > self.pot_odds
        ev_c = QColor(C.GREEN) if ev_ok else QColor(C.DANGER)
        p.setPen(QPen(ev_c)); p.drawText(rx, bar_y + bar_h + sc(11), "✓ 正EV 可跟注" if ev_ok else "✗ 负EV 考虑弃牌")
        p.setPen(QPen(QColor(C.GOLD))); p.drawText(w - sc(62), h // 2 + sc(5), self.hand_name[:7])


# ─── Action colors for AI feedback ───────────────────────────────────────────

ACTION_STYLE = {
    PlayerAction.FOLD:   ('#ef4444', '❌ 弃牌'),
    PlayerAction.CHECK:  ('#6b7280', '○ 过牌'),
    PlayerAction.CALL:   ('#3b82f6', '→ 跟注'),
    PlayerAction.RAISE:  ('#f59e0b', '↑ 加注'),
    PlayerAction.ALL_IN: ('#a855f7', '⚡ 全押'),
}


# ─── Player Panel ─────────────────────────────────────────────────────────────

class PlayerPanel(QFrame):
    def __init__(self, player: Player, is_human=False, compact=False, parent=None):
        super().__init__(parent)
        self.player = player
        self.is_human = is_human
        self.compact = compact
        self.is_active = False
        self.card_widgets: List[CardWidget] = []
        self._flash_color: Optional[str] = None
        self._last_action: Optional[PlayerAction] = None
        self._chip_delta: int = 0
        self._prev_chips: int = player.chips
        self._build()

    def _build(self):
        C_ = self.compact
        self.setMinimumHeight(sc(120 if C_ else (170 if self.is_human else 155)))
        self._style()
        lo = QVBoxLayout(self)
        lo.setContentsMargins(sc(6 if C_ else 10), sc(5 if C_ else 9),
                              sc(6 if C_ else 10), sc(5 if C_ else 9))
        lo.setSpacing(sc(2 if C_ else 4))

        # ── Header ─────────────────────────────────────────────────────────
        hdr = QHBoxLayout(); hdr.setSpacing(sc(3 if C_ else 5))
        nc = C.GOLD if self.is_human else C.TEXT
        self.name_lbl = QLabel(self.player.name)
        self.name_lbl.setFont(QFont('', sc(10 if C_ else 13), QFont.Bold))
        self.name_lbl.setStyleSheet(f"color:{nc};")

        self.dealer_badge = QLabel(" ◆ 庄 ")
        self.dealer_badge.setFont(QFont('', sc(7 if C_ else 9), QFont.Bold))
        self.dealer_badge.setStyleSheet(f"color:{C.GOLD};background:rgba(212,175,55,.25);padding:1px 3px;border-radius:4px;border:1px solid #d4af3788;")
        self.dealer_badge.hide()

        self.action_badge = QLabel("")
        self.action_badge.setFont(QFont('', sc(9 if C_ else 11), QFont.Bold))
        self.action_badge.setAlignment(Qt.AlignCenter)
        self.action_badge.setStyleSheet("color:#6b7280;padding:1px 4px;border-radius:4px;")
        self.action_badge.hide()

        hdr.addWidget(self.name_lbl); hdr.addWidget(self.dealer_badge)
        hdr.addStretch(); hdr.addWidget(self.action_badge)
        lo.addLayout(hdr)

        # ── Chips ──────────────────────────────────────────────────────────
        chips_row = QHBoxLayout(); chips_row.setSpacing(sc(4))
        self.chip_lbl = ChipLabel(self.player.chips, compact=C_)
        self.delta_lbl = QLabel("")
        self.delta_lbl.setFont(QFont('', sc(8 if C_ else 10), QFont.Bold))
        self.delta_lbl.setStyleSheet("color:transparent;")
        chips_row.addWidget(self.chip_lbl)
        chips_row.addWidget(self.delta_lbl)
        chips_row.addStretch()
        lo.addLayout(chips_row)

        # ── Cards ──────────────────────────────────────────────────────────
        cw = QWidget(); cl = QHBoxLayout(cw)
        cl.setContentsMargins(0, 0, 0, 0)
        cl.setSpacing(sc(2 if C_ else 4))
        cl.addStretch()
        for _ in range(5):
            crd = CardWidget(small=True, tiny=C_)
            self.card_widgets.append(crd); cl.addWidget(crd)
        cl.addStretch()
        lo.addWidget(cw)

        # ── Hand name ──────────────────────────────────────────────────────
        self.hand_lbl = QLabel("")
        self.hand_lbl.setAlignment(Qt.AlignCenter)
        self.hand_lbl.setFont(QFont('', sc(9 if C_ else 11), QFont.Bold))
        self.hand_lbl.setStyleSheet(f"color:{C.GOLD};padding:{sc(1)}px 0;")
        lo.addWidget(self.hand_lbl)

        # ── Bet ────────────────────────────────────────────────────────────
        self.bet_lbl = QLabel("")
        self.bet_lbl.setAlignment(Qt.AlignCenter)
        self.bet_lbl.setFont(QFont('', sc(8 if C_ else 10)))
        self.bet_lbl.setStyleSheet("color:#60a5fa;")
        lo.addWidget(self.bet_lbl)

    def _style(self, flash_color: Optional[str] = None):
        if flash_color:
            self.setStyleSheet(f"PlayerPanel{{background:{flash_color}22;border:2px solid {flash_color};border-radius:{sc(10)}px;}}")
            return
        if self.player.folded:
            bg, bd = 'rgba(0,0,0,.3)', '#4b5563'
        elif self.is_active:
            bg, bd = 'rgba(212,175,55,.12)', C.GOLD
        else:
            bg = 'rgba(255,255,255,.03)'
            bd = C.BORDER2 if self.is_human else C.BORDER
        self.setStyleSheet(f"PlayerPanel{{background:{bg};border:2px solid {bd};border-radius:{sc(10)}px;}}")

    def flash_action(self, action: PlayerAction, raise_to: int = 0):
        """Show a vivid visual flash when AI takes an action."""
        self._last_action = action
        color, label = ACTION_STYLE.get(action, ('#6b7280', '?'))

        if action == PlayerAction.RAISE:
            label = f"↑ 加注 {raise_to}"
        elif action == PlayerAction.CALL:
            amt = self.player.bet_this_round
            label = f"→ 跟注 {amt}" if amt else "→ 跟注"

        # Update action badge
        self.action_badge.setText(label)
        self.action_badge.setFont(QFont('', sc(11), QFont.Bold))
        self.action_badge.setStyleSheet(
            f"color:white;background:{color};padding:{sc(3)}px {sc(8)}px;"
            f"border-radius:{sc(5)}px;font-weight:bold;"
        )
        self.action_badge.show()

        # Flash the panel border
        self._style(flash_color=color)
        QTimer.singleShot(900, self._unflash)

    def _unflash(self):
        self._style()

    def refresh(self):
        self._style()
        self.chip_lbl.set_amount(self.player.chips)

        # Chip delta
        delta = self.player.chips - self._prev_chips
        if delta != 0:
            sign = '+' if delta > 0 else ''
            col = '#22c55e' if delta > 0 else '#f87171'
            self.delta_lbl.setText(f"{sign}{delta}")
            self.delta_lbl.setFont(QFont('', sc(10), QFont.Bold))
            self.delta_lbl.setStyleSheet(f"color:{col};")
            self._prev_chips = self.player.chips
        else:
            self.delta_lbl.setText("")

        for i, cw in enumerate(self.card_widgets):
            card = self.player.cards[i] if i < len(self.player.cards) else None
            # Human player always sees their own hole card (index 0)
            show_face = (self.is_human and i == 0)
            cw.set_card(card, show_face=show_face)
        self.dealer_badge.setVisible(self.player.is_dealer)

        # Action badge updates for fold/allin persist; others fade after unflash
        if self.player.folded and self._last_action != PlayerAction.FOLD:
            self._last_action = PlayerAction.FOLD
            color, label = ACTION_STYLE[PlayerAction.FOLD]
            self.action_badge.setText(label)
            self.action_badge.setFont(QFont('', sc(11), QFont.Bold))
            self.action_badge.setStyleSheet(
                f"color:white;background:{color};padding:{sc(3)}px {sc(8)}px;border-radius:{sc(5)}px;")
            self.action_badge.show()
        elif self.player.all_in and self._last_action != PlayerAction.ALL_IN:
            self._last_action = PlayerAction.ALL_IN
            color, label = ACTION_STYLE[PlayerAction.ALL_IN]
            self.action_badge.setText(label)
            self.action_badge.setFont(QFont('', sc(11), QFont.Bold))
            self.action_badge.setStyleSheet(
                f"color:white;background:{color};padding:{sc(3)}px {sc(8)}px;border-radius:{sc(5)}px;")
            self.action_badge.show()

        all_c = [c for c in self.player.cards if not c.face_up] + self.player.visible_cards()
        if all_c and (self.is_human or self.player.folded):
            _, _, hn = evaluate_hand(all_c); self.hand_lbl.setText(hn)
        elif self.player.visible_cards():
            _, _, hn = evaluate_hand(self.player.visible_cards()); self.hand_lbl.setText(f"({hn})")
        else:
            self.hand_lbl.setText("")

        self.bet_lbl.setText(f"已押注 {self.player.bet_this_round}" if self.player.bet_this_round > 0 else "")

    def reset_action_badge(self):
        """Clear action badge at start of new round."""
        self._last_action = None
        self._prev_chips = self.player.chips
        self.action_badge.hide()
        self.action_badge.setText("")
        self._style()

    def highlight_winner(self):
        self.setStyleSheet(f"PlayerPanel{{background:rgba(212,175,55,.18);border:3px solid #ffd700;border-radius:{sc(10)}px;}}")
        for cw in self.card_widgets: cw.set_winner(True)

    def set_active(self, a):
        self.is_active = a; self._style()


# ─── Action Button ────────────────────────────────────────────────────────────

class ActionButton(QPushButton):
    def __init__(self, text, color=C.BG_LIGHT, hotkey='', parent=None):
        super().__init__(text, parent)
        self.base_color = color; self.hotkey = hotkey
        self.setMinimumHeight(sc(46)); self.setMinimumWidth(sc(100))
        self.setCursor(Qt.PointingHandCursor); self._sty()

    def _sty(self):
        self.setStyleSheet(f"""
            QPushButton{{background:{self.base_color};color:white;border:none;
                border-radius:{sc(8)}px;font-size:{sc(13)}px;font-weight:bold;
                font-family:'Microsoft YaHei',Arial;
                padding:{sc(8)}px {sc(14)}px;min-height:{sc(38)}px;}}
            QPushButton:hover{{background:{QColor(self.base_color).lighter(130).name()};}}
            QPushButton:pressed{{background:{QColor(self.base_color).darker(110).name()};}}
            QPushButton:disabled{{background:#2d3748;color:#6b7280;}}
        """)

    def update_hotkey_hint(self, show):
        self.setToolTip(f"快捷键: {self.hotkey}" if self.hotkey and show else "")


# ─── Raise Dialog ─────────────────────────────────────────────────────────────

class RaiseDialog(QDialog):
    def __init__(self, mn, mx, cb, pot, parent=None):
        super().__init__(parent); self.setWindowTitle("设置加注金额")
        self.setModal(True); self.setFixedSize(sc(400), sc(230))
        self.raise_amount = mn; self._build(mn, mx, cb, pot)
        self.setStyleSheet(f"QDialog{{background:#111827;border:2px solid #374151;border-radius:{sc(12)}px;}} QLabel{{color:#f0f0f0;}} QSlider::groove:horizontal{{height:6px;background:#374151;border-radius:3px;}} QSlider::handle:horizontal{{background:#d4af37;width:{sc(18)}px;height:{sc(18)}px;margin:-6px 0;border-radius:{sc(9)}px;}} QSlider::sub-page:horizontal{{background:#d4af37;border-radius:3px;}}")

    def _build(self, mn, mx, cb, pot):
        lo = QVBoxLayout(self); lo.setContentsMargins(sc(20),sc(18),sc(20),sc(18)); lo.setSpacing(sc(10))
        title = QLabel("💰 加注金额"); title.setStyleSheet(f"font-size:{sc(17)}px;font-weight:bold;color:{C.GOLD};"); title.setAlignment(Qt.AlignCenter); lo.addWidget(title)
        info = QLabel(f"当前注: {cb}  |  底池: {pot}  |  最小加注至: {mn}"); info.setStyleSheet(f"font-size:{sc(10)}px;color:{C.TEXT2};"); info.setAlignment(Qt.AlignCenter); lo.addWidget(info)
        self.amt_lbl = QLabel(str(mn)); self.amt_lbl.setStyleSheet(f"font-size:{sc(24)}px;font-weight:bold;color:{C.GOLD};"); self.amt_lbl.setAlignment(Qt.AlignCenter); lo.addWidget(self.amt_lbl)
        self.slider = QSlider(Qt.Horizontal); self.slider.setMinimum(mn); self.slider.setMaximum(mx); self.slider.setValue(mn)
        self.slider.valueChanged.connect(lambda v: self.amt_lbl.setText(str(v))); lo.addWidget(self.slider)
        qr = QHBoxLayout()
        for lbl, ratio in [("⅓底池",.33),("½底池",.5),("¾底池",.75),("全押",1.0)]:
            v = int(pot*ratio) if ratio < 1.0 else mx; v = max(mn, min(v, mx))
            b = QPushButton(lbl); b.setStyleSheet(f"QPushButton{{background:#374151;color:{C.GOLD};border:1px solid #d4af3766;border-radius:{sc(5)}px;padding:{sc(3)}px {sc(6)}px;font-size:{sc(11)}px;}} QPushButton:hover{{background:#4b5563;}}"); b.clicked.connect(lambda _,vv=v: self.slider.setValue(vv)); qr.addWidget(b)
        lo.addLayout(qr)
        br = QHBoxLayout()
        cancel = QPushButton("取消"); cancel.setStyleSheet(f"background:#374151;color:{C.TEXT2};border:none;border-radius:{sc(8)}px;padding:{sc(7)}px {sc(18)}px;"); cancel.clicked.connect(self.reject)
        ok = QPushButton("确认加注"); ok.setStyleSheet(f"background:{C.GOLD};color:#000;font-weight:bold;border:none;border-radius:{sc(8)}px;padding:{sc(7)}px {sc(18)}px;"); ok.clicked.connect(self._confirm)
        br.addWidget(cancel); br.addWidget(ok); lo.addLayout(br)

    def _confirm(self): self.raise_amount = self.slider.value(); self.accept()


# ─── Settings Dialog ──────────────────────────────────────────────────────────

class SettingsDialog(QDialog):
    applied = pyqtSignal(dict)

    def __init__(self, current: dict, parent=None):
        super().__init__(parent)
        self.setWindowTitle("⚙️  游戏设置"); self.setModal(True); self.setMinimumSize(530, 490); self.resize(530, 490)
        self.s = dict(current); self._build()
        self.setStyleSheet(f"""
            QDialog{{background:{C.BG_MED};}}
            QLabel{{color:{C.TEXT};font-family:'Microsoft YaHei',Arial;}}
            QTabWidget::pane{{border:1px solid {C.BORDER};background:{C.BG_MED};}}
            QTabBar::tab{{background:{C.BG_LIGHT};color:{C.TEXT2};padding:8px 18px;border-radius:4px 4px 0 0;margin-right:2px;font-size:13px;}}
            QTabBar::tab:selected{{background:{C.BORDER};color:{C.GOLD};}}
            QGroupBox{{color:{C.GOLD};border:1px solid {C.BORDER};border-radius:8px;padding:12px;margin-top:8px;font-size:13px;}}
            QGroupBox::title{{subcontrol-origin:margin;left:10px;padding:0 5px;}}
            QComboBox,QSpinBox{{background:{C.BG_LIGHT};color:{C.TEXT};border:1px solid {C.BORDER};border-radius:6px;padding:5px;min-width:140px;font-size:12px;}}
            QComboBox QAbstractItemView{{background:{C.BG_LIGHT};color:{C.TEXT};selection-background-color:{C.BORDER};}}
            QCheckBox{{color:{C.TEXT};font-size:13px;spacing:8px;}}
            QCheckBox::indicator{{width:18px;height:18px;border-radius:4px;border:2px solid {C.BORDER};background:{C.BG_LIGHT};}}
            QCheckBox::indicator:checked{{background:{C.GOLD};border-color:{C.GOLD};}}
            QSlider::groove:horizontal{{height:6px;background:{C.BORDER};border-radius:3px;}}
            QSlider::handle:horizontal{{background:{C.GOLD};width:16px;height:16px;margin:-5px 0;border-radius:8px;}}
            QSlider::sub-page:horizontal{{background:{C.GOLD};border-radius:3px;}}
        """)

    def _build(self):
        lo = QVBoxLayout(self); lo.setContentsMargins(16,16,16,16); lo.setSpacing(12)
        tl = QLabel("⚙️  游戏设置"); tl.setStyleSheet(f"font-size:20px;font-weight:bold;color:{C.GOLD};"); tl.setAlignment(Qt.AlignCenter); lo.addWidget(tl)
        tabs = QTabWidget()

        # ── 显示 tab
        dt = QWidget(); dl = QVBoxLayout(dt); dl.setContentsMargins(10,10,10,10); dl.setSpacing(10)
        wg = QGroupBox("🖥  窗口尺寸"); wgr = QGridLayout(wg); wgr.setSpacing(8)
        self.w_spin = QSpinBox(); self.w_spin.setRange(800,3840); self.w_spin.setValue(self.s['window_width'])
        self.h_spin = QSpinBox(); self.h_spin.setRange(600,2160); self.h_spin.setValue(self.s['window_height'])
        self.fs_chk = QCheckBox("全屏模式"); self.fs_chk.setChecked(self.s['fullscreen'])

        res_row = QHBoxLayout()
        for label, rw, rh in [("1280×720",1280,720),("1600×900",1600,900),("1920×1080",1920,1080),("2560×1440",2560,1440)]:
            b = QPushButton(label); b.setStyleSheet(f"QPushButton{{background:{C.BORDER};color:{C.TEXT2};border:1px solid {C.BORDER2};border-radius:5px;padding:3px 8px;font-size:11px;}} QPushButton:hover{{color:{C.GOLD};}}"); b.clicked.connect(lambda _,x=rw,y=rh:(self.w_spin.setValue(x),self.h_spin.setValue(y))); res_row.addWidget(b)

        wgr.addWidget(QLabel("宽度:"),0,0); wgr.addWidget(self.w_spin,0,1)
        wgr.addWidget(QLabel("高度:"),1,0); wgr.addWidget(self.h_spin,1,1)
        wgr.addWidget(self.fs_chk,2,0,1,2); wgr.addLayout(res_row,3,0,1,2)
        dl.addWidget(wg)

        sg = QGroupBox("🔍  UI 缩放"); sv = QVBoxLayout(sg)
        srow = QHBoxLayout()
        self.scale_sl = QSlider(Qt.Horizontal); self.scale_sl.setRange(50,200); self.scale_sl.setValue(int(self.s['ui_scale']*100))
        self.scale_lbl = QLabel(f"{self.s['ui_scale']:.2f}x"); self.scale_lbl.setStyleSheet(f"color:{C.GOLD};font-weight:bold;min-width:45px;")
        self.scale_sl.valueChanged.connect(lambda v: self.scale_lbl.setText(f"{v/100:.2f}x"))
        srow.addWidget(self.scale_sl); srow.addWidget(self.scale_lbl); sv.addLayout(srow)
        sbr = QHBoxLayout()
        for lbl, sv2 in [("75%",75),("100%",100),("125%",125),("150%",150)]:
            b = QPushButton(lbl); b.setStyleSheet(f"QPushButton{{background:{C.BORDER};color:{C.TEXT2};border:1px solid {C.BORDER2};border-radius:5px;padding:3px 10px;font-size:11px;}} QPushButton:hover{{color:{C.GOLD};}}"); b.clicked.connect(lambda _,v=sv2: self.scale_sl.setValue(v)); sbr.addWidget(b)
        sv.addLayout(sbr); dl.addWidget(sg); dl.addStretch(); tabs.addTab(dt, "显示")

        # ── 游戏 tab
        gt = QWidget(); gl = QVBoxLayout(gt); gl.setContentsMargins(10,10,10,10); gl.setSpacing(10)
        spd_g = QGroupBox("⏱  AI 速度"); spd_v = QVBoxLayout(spd_g)
        spd_row = QHBoxLayout()
        self.spd_sl = QSlider(Qt.Horizontal); self.spd_sl.setRange(200,3000); self.spd_sl.setValue(self.s['ai_speed'])
        self.spd_lbl = QLabel(self._spd_txt(self.s['ai_speed'])); self.spd_lbl.setStyleSheet(f"color:{C.GOLD};font-weight:bold;min-width:55px;")
        self.spd_sl.valueChanged.connect(lambda v: self.spd_lbl.setText(self._spd_txt(v)))
        spd_row.addWidget(self.spd_sl); spd_row.addWidget(self.spd_lbl); spd_v.addLayout(spd_row)
        spd_br = QHBoxLayout()
        for lbl, v in [("极快",300),("快速",600),("正常",1200),("慢速",2000)]:
            b = QPushButton(lbl); b.setStyleSheet(f"QPushButton{{background:{C.BORDER};color:{C.TEXT2};border:1px solid {C.BORDER2};border-radius:5px;padding:3px 10px;font-size:11px;}} QPushButton:hover{{color:{C.GOLD};}}"); b.clicked.connect(lambda _,vv=v: self.spd_sl.setValue(vv)); spd_br.addWidget(b)
        spd_v.addLayout(spd_br); gl.addWidget(spd_g)

        ug = QGroupBox("🎛  界面选项"); uv = QVBoxLayout(ug)
        self.hud_chk = QCheckBox("显示胜率 / 底池赔率 HUD"); self.hud_chk.setChecked(self.s['show_hud'])
        self.hk_chk  = QCheckBox("显示快捷键提示");            self.hk_chk.setChecked(self.s['show_hotkeys'])
        uv.addWidget(self.hud_chk); uv.addWidget(self.hk_chk); gl.addWidget(ug)

        hkg = QGroupBox("⌨️  快捷键参考"); hkgr = QGridLayout(hkg); hkgr.setSpacing(6)
        hks = [("F","弃牌"),("C / Space","跟注 / 过牌"),("R","加注"),("A","全押"),
               ("N","下一局"),("F11","全屏切换"),("Ctrl+S","存档"),("F1","查看规则")]
        for i, (k, v) in enumerate(hks):
            kl = QLabel(k); kl.setStyleSheet(f"background:{C.BORDER};color:{C.GOLD};font-weight:bold;padding:2px 7px;border-radius:4px;font-family:monospace;font-size:12px;")
            vl = QLabel(v); vl.setStyleSheet(f"color:{C.TEXT};font-size:12px;")
            hkgr.addWidget(kl,i//2,(i%2)*2); hkgr.addWidget(vl,i//2,(i%2)*2+1)
        gl.addWidget(hkg); gl.addStretch(); tabs.addTab(gt, "游戏")

        lo.addWidget(tabs)
        br = QHBoxLayout()
        rst = QPushButton("重置默认"); rst.setStyleSheet(f"QPushButton{{background:{C.BORDER};color:{C.TEXT2};border:none;border-radius:8px;padding:7px 14px;font-size:12px;}} QPushButton:hover{{background:{C.BORDER2};}}")
        rst.clicked.connect(self._reset)
        can = QPushButton("取消"); can.setStyleSheet(f"QPushButton{{background:{C.BORDER};color:{C.TEXT2};border:none;border-radius:8px;padding:7px 18px;font-size:13px;}} QPushButton:hover{{background:{C.BORDER2};}}")
        can.clicked.connect(self.reject)
        apl = QPushButton("应用 ✓"); apl.setStyleSheet(f"QPushButton{{background:{C.GOLD};color:#000;font-weight:bold;border:none;border-radius:8px;padding:7px 22px;font-size:13px;}} QPushButton:hover{{background:{C.GOLD_L};}}")
        apl.clicked.connect(self._apply)
        br.addWidget(rst); br.addStretch(); br.addWidget(can); br.addWidget(apl); lo.addLayout(br)

    def _spd_txt(self, v):
        return "极快" if v<=400 else ("快速" if v<=700 else ("正常" if v<=1400 else ("慢速" if v<=2000 else "很慢")))

    def _reset(self):
        d = DEFAULT_SETTINGS
        self.w_spin.setValue(d['window_width']); self.h_spin.setValue(d['window_height'])
        self.fs_chk.setChecked(d['fullscreen']); self.scale_sl.setValue(int(d['ui_scale']*100))
        self.spd_sl.setValue(d['ai_speed']); self.hud_chk.setChecked(d['show_hud']); self.hk_chk.setChecked(d['show_hotkeys'])

    def _apply(self):
        self.s.update({'window_width':self.w_spin.value(),'window_height':self.h_spin.value(),
                        'fullscreen':self.fs_chk.isChecked(),'ui_scale':self.scale_sl.value()/100.0,
                        'ai_speed':self.spd_sl.value(),'show_hud':self.hud_chk.isChecked(),
                        'show_hotkeys':self.hk_chk.isChecked()})
        self.applied.emit(self.s); self.accept()


# ─── Leaderboard Dialog ───────────────────────────────────────────────────────

class LeaderboardDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent); self.setWindowTitle("🏆 排行榜"); self.setModal(True); self.setMinimumSize(560, 420); self.resize(560, 420)
        self.setStyleSheet(f"QDialog{{background:{C.BG_MED};}} QLabel{{color:{C.TEXT};}} QTableWidget{{background:{C.BG_DARK};color:{C.TEXT};border:1px solid {C.BORDER};gridline-color:{C.BG_LIGHT};font-size:13px;}} QHeaderView::section{{background:{C.BG_LIGHT};color:{C.GOLD};font-weight:bold;padding:6px;border:none;font-size:12px;}} QTableWidget::item:selected{{background:{C.BORDER};}}")
        lo = QVBoxLayout(self); lo.setContentsMargins(16,16,16,16); lo.setSpacing(12)
        tl = QLabel("🏆 历史最佳成绩"); tl.setStyleSheet(f"font-size:20px;font-weight:bold;color:{C.GOLD};"); tl.setAlignment(Qt.AlignCenter); lo.addWidget(tl)
        self.tbl = QTableWidget(); self.tbl.setColumnCount(5)
        self.tbl.setHorizontalHeaderLabels(["排名","玩家","最终筹码","对局数","日期"])
        self.tbl.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.tbl.setEditTriggers(QTableWidget.NoEditTriggers)
        self.tbl.setAlternatingRowColors(True); self.tbl.verticalHeader().hide()
        lo.addWidget(self.tbl); self._load()
        br = QHBoxLayout()
        cl = QPushButton("清除记录"); cl.setStyleSheet(f"QPushButton{{background:#7f1d1d;color:#fca5a5;border:none;border-radius:6px;padding:6px 14px;}} QPushButton:hover{{background:#991b1b;}}"); cl.clicked.connect(self._clear)
        ok = QPushButton("关闭"); ok.setStyleSheet(f"QPushButton{{background:{C.BORDER};color:{C.TEXT};border:none;border-radius:6px;padding:6px 18px;}} QPushButton:hover{{background:{C.BORDER2};}}"); ok.clicked.connect(self.accept)
        br.addWidget(cl); br.addStretch(); br.addWidget(ok); lo.addLayout(br)

    def _load(self):
        lb = load_leaderboard(); self.tbl.setRowCount(len(lb))
        medal = {0:'🥇',1:'🥈',2:'🥉'}
        for i, e in enumerate(lb):
            items = [QTableWidgetItem(medal.get(i,str(i+1))), QTableWidgetItem(e.get('name','?')),
                     QTableWidgetItem(f"{e.get('chips',0):,}"), QTableWidgetItem(str(e.get('rounds',0))),
                     QTableWidgetItem(e.get('date',''))]
            for j, it in enumerate(items):
                it.setTextAlignment(Qt.AlignCenter)
                if i < 3: it.setForeground(QColor(C.GOLD))
                self.tbl.setItem(i, j, it)

    def _clear(self):
        if QMessageBox.question(self,"清除","确定清除所有排行榜?",QMessageBox.Yes|QMessageBox.No)==QMessageBox.Yes:
            save_leaderboard([]); self._load()


# ─── Stats Dialog ─────────────────────────────────────────────────────────────

class StatsDialog(QDialog):
    def __init__(self, ai_players, game, parent=None):
        super().__init__(parent); self.setWindowTitle("📊 统计"); self.setModal(True); self.setMinimumSize(500,420); self.resize(500,420)
        self.setStyleSheet(f"QDialog{{background:{C.BG_MED};}} QLabel{{color:{C.TEXT};}} QTabWidget::pane{{border:1px solid {C.BORDER};background:{C.BG_MED};}} QTabBar::tab{{background:{C.BG_LIGHT};color:{C.TEXT2};padding:8px 16px;border-radius:4px 4px 0 0;margin-right:2px;}} QTabBar::tab:selected{{background:{C.BORDER};color:{C.GOLD};}} QGroupBox{{color:{C.GOLD};border:1px solid {C.BORDER};border-radius:8px;padding:10px;margin-top:8px;}} QGroupBox::title{{subcontrol-origin:margin;left:10px;padding:0 5px;}}")
        lo = QVBoxLayout(self); tabs = QTabWidget()
        at = QWidget(); al = QVBoxLayout(at)
        for ai in ai_players:
            s = ai.get_stats(); g = QGroupBox(f"🤖 {ai.player.name} ({ai.difficulty})")
            gr = QGridLayout(g)
            for i,(k,v) in enumerate([("对局数",s['games_played']),("胜率",s['win_rate']),("探索率",s['epsilon']),("总盈亏",s['total_winnings']),("Q表大小",s['q_table_size']),("当前筹码",ai.player.chips)]):
                kl = QLabel(f"{k}:"); kl.setStyleSheet(f"color:{C.TEXT2};font-size:12px;")
                vl = QLabel(str(v)); vl.setStyleSheet(f"color:{C.TEXT};font-size:12px;font-weight:bold;")
                gr.addWidget(kl,i//2,(i%2)*2); gr.addWidget(vl,i//2,(i%2)*2+1)
            al.addWidget(g)
        al.addStretch(); tabs.addTab(at,"AI统计")
        lt = QWidget(); ll = QVBoxLayout(lt)
        tx = QTextEdit(); tx.setReadOnly(True); tx.setStyleSheet(f"QTextEdit{{background:{C.BG_DARK};color:#e0e0e0;font-family:'Courier New';font-size:12px;border:1px solid {C.BORDER};border-radius:6px;}}")
        tx.setText('\n'.join(game.action_log)); ll.addWidget(tx); tabs.addTab(lt,"行动记录")
        lo.addWidget(tabs)
        cl = QPushButton("关闭"); cl.setStyleSheet(f"QPushButton{{background:{C.BORDER};color:{C.TEXT};border:none;border-radius:8px;padding:8px 24px;}} QPushButton:hover{{background:{C.BORDER2};}}"); cl.clicked.connect(self.accept); lo.addWidget(cl, alignment=Qt.AlignRight)


# ─── Training Thread ──────────────────────────────────────────────────────────

class TrainingThread(QThread):
    progress = pyqtSignal(int, int, str)
    finished = pyqtSignal(str)

    def __init__(self, n):
        super().__init__(); self.n = n

    def run(self):
        def cb(gn, tot, wc):
            top = max(wc, key=wc.get, default='?')
            self.progress.emit(gn, tot, f"领先:{top}({wc.get(top,0)}胜)")
        self.progress.emit(0, self.n, "开始...")
        self_play_training(num_games=self.n, num_ai=3, save_path="trained_ai.json", progress_callback=cb)
        self.finished.emit("训练完成! 模型已保存。")


# ─── Table Widget ─────────────────────────────────────────────────────────────

class TableWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent); self.setMinimumSize(sc(280), sc(200))
        self.game = None; self.players = []

    def set_players(self, p): self.players = p; self.update()
    def update_state(self, g): self.game = g; self.players = g.players; self.update()

    def paintEvent(self, event):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        w, h = self.width(), self.height()

        # Draw felt table
        gr = QRadialGradient(w//2,h//2,max(w,h)//2)
        gr.setColorAt(0,QColor('#1a4a2a')); gr.setColorAt(.7,QColor('#0d2416')); gr.setColorAt(1,QColor('#081a0e'))
        p.setBrush(QBrush(gr)); p.setPen(QPen(QColor(C.GOLD_D),3))
        p.drawEllipse(10,10,w-20,h-20)
        p.setPen(QPen(QColor(212,175,55,80),1)); p.setBrush(Qt.NoBrush)
        p.drawEllipse(20,20,w-40,h-40)

        if not self.game:
            f = QFont('', sc(13), QFont.Bold); p.setFont(f)
            fm = QFontMetrics(f)
            txt = "港式梭哈"
            p.setPen(QPen(QColor(C.TEXT2)))
            p.drawText((w - fm.horizontalAdvance(txt))//2, (h + fm.ascent())//2, txt)
            return

        # ── measure all three lines first, then position them centred ──
        # Line 1: pot
        fs1 = max(9, sc(11))
        f1 = QFont('', fs1, QFont.Bold); fm1 = QFontMetrics(f1)
        pot_txt = f"底池: {self.game.pot:,}"

        # Line 2: phase
        fs2 = max(8, sc(9))
        f2 = QFont('', fs2); fm2 = QFontMetrics(f2)
        phase_txt = PHASE_NAMES.get(self.game.phase, '')

        # Line 3: dealer
        dl = next((pl for pl in self.players if pl.is_dealer), None)
        fs3 = max(7, sc(9))
        f3 = QFont('', fs3); fm3 = QFontMetrics(f3)
        dl_txt = f"庄: {dl.name}" if dl else ""

        gap = sc(5)
        total_h = fm1.height() + gap + fm2.height() + (gap + fm3.height() if dl_txt else 0)
        y = (h - total_h) // 2 + fm1.ascent()

        # Draw pot
        p.setFont(f1); p.setPen(QPen(QColor(C.GOLD)))
        p.drawText((w - fm1.horizontalAdvance(pot_txt))//2, y, pot_txt)
        y += fm1.descent() + gap + fm2.ascent()

        # Draw phase
        p.setFont(f2); p.setPen(QPen(QColor(200,200,200,210)))
        p.drawText((w - fm2.horizontalAdvance(phase_txt))//2, y, phase_txt)

        # Draw dealer
        if dl_txt:
            y += fm2.descent() + gap + fm3.ascent()
            p.setFont(f3); p.setPen(QPen(QColor(C.GOLD_L)))
            p.drawText((w - fm3.horizontalAdvance(dl_txt))//2, y, dl_txt)


# ─── Main Window ──────────────────────────────────────────────────────────────

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        global _SCALE
        self.settings = load_settings()
        _SCALE = self.settings['ui_scale']

        self.setWindowTitle("🃏 港式梭哈 — Hong Kong Stud Poker")
        self.setMinimumSize(800, 600)

        self.game: Optional[HKStudGame] = None
        self.human_player: Optional[Player] = None
        self.ai_players: List[AIPlayer] = []
        self.all_players: List[Player] = []
        self.player_panels: Dict[str, PlayerPanel] = {}
        self.waiting_for_human = False
        self.game_running = False
        self._game_config: dict = {}

        self._setup_menubar()
        self._setup_ui()
        self._setup_shortcuts()
        self._apply_window_settings()

    # ── Menubar ────────────────────────────────────────────────────────────────

    def _setup_menubar(self):
        mb = self.menuBar()
        mb.setStyleSheet(f"QMenuBar{{background:{C.BG_DARK};color:{C.TEXT2};font-size:13px;}} QMenuBar::item:selected{{background:{C.BG_LIGHT};color:{C.GOLD};}} QMenu{{background:{C.BG_MED};color:{C.TEXT};border:1px solid {C.BORDER};font-size:13px;}} QMenu::item:selected{{background:{C.BORDER};color:{C.GOLD};}} QMenu::separator{{height:1px;background:{C.BORDER};margin:4px 0;}}")

        fm = mb.addMenu("文件(&F)")
        self._add_action(fm, "新游戏(&N)", self._show_setup_dialog, "Ctrl+N")
        fm.addSeparator()
        self._add_action(fm, "保存进度(&S)", self._save_game, "Ctrl+S")
        self._add_action(fm, "读取存档(&O)", self._load_game, "Ctrl+O")
        fm.addSeparator()
        self._add_action(fm, "退出(&Q)", QApplication.quit, "Ctrl+Q")

        vm = mb.addMenu("视图(&V)")
        self._add_action(vm, "全屏(&F11)", self._toggle_fullscreen, "F11")
        vm.addSeparator()
        self._add_action(vm, "设置(&,)", self._show_settings, "Ctrl+,")

        gm = mb.addMenu("游戏(&G)")
        self._add_action(gm, "AI自我训练", self._show_training_page)
        self._add_action(gm, "排行榜(&R)", self._show_leaderboard, "Ctrl+R")
        gm.addSeparator()
        self._add_action(gm, "游戏统计", self._show_stats)

        hm = mb.addMenu("帮助(&H)")
        self._add_action(hm, "游戏规则(&F1)", self._show_rules, "F1")
        hm.addSeparator()
        self._add_action(hm, "关于", self._show_about)

    def _add_action(self, menu, text, slot, shortcut=None):
        a = QAction(text, self)
        if shortcut: a.setShortcut(shortcut)
        a.triggered.connect(slot); menu.addAction(a)

    # ── Shortcuts ──────────────────────────────────────────────────────────────

    def _setup_shortcuts(self):
        QShortcut(QKeySequence('F'),    self, lambda: self._human_action(PlayerAction.FOLD))
        QShortcut(QKeySequence('C'),    self, self._hk_call_check)
        QShortcut(QKeySequence('R'),    self, self._human_raise_dialog)
        QShortcut(QKeySequence('A'),    self, lambda: self._human_action(PlayerAction.ALL_IN))
        QShortcut(QKeySequence('Space'),self, self._hk_call_check)
        QShortcut(QKeySequence('N'),    self, self._start_next_round)
        QShortcut(QKeySequence('F11'),  self, self._toggle_fullscreen)
        QShortcut(QKeySequence('F1'),   self, self._show_rules)
        QShortcut(QKeySequence('Ctrl+,'),self,self._show_settings)

    def _hk_call_check(self):
        if not self.waiting_for_human: return
        valid = self.game.get_valid_actions(self.human_player)
        if PlayerAction.CHECK in valid: self._human_action(PlayerAction.CHECK)
        elif PlayerAction.CALL in valid: self._human_action(PlayerAction.CALL)

    # ── UI Build ───────────────────────────────────────────────────────────────

    def _setup_ui(self):
        cw = QWidget(); self.setCentralWidget(cw)
        cw.setStyleSheet(f"background:{C.BG_DARK};")
        self.stack = QStackedWidget(cw)
        ml = QVBoxLayout(cw); ml.setContentsMargins(0,0,0,0); ml.addWidget(self.stack)

        self.menu_page     = self._build_menu_page()
        self.game_page     = self._build_game_page()
        self.training_page = self._build_training_page()
        self.stack.addWidget(self.menu_page)
        self.stack.addWidget(self.game_page)
        self.stack.addWidget(self.training_page)
        self.stack.setCurrentIndex(0)

    def _apply_window_settings(self):
        global _SCALE
        s = self.settings; _SCALE = s['ui_scale']
        if s['fullscreen']:
            self.showFullScreen()
        else:
            self.resize(s['window_width'], s['window_height'])
            scr = QApplication.primaryScreen().geometry()
            self.move(max(0,(scr.width()-s['window_width'])//2),
                      max(0,(scr.height()-s['window_height'])//2))

    def _toggle_fullscreen(self):
        if self.isFullScreen():
            self.showNormal(); self.settings['fullscreen'] = False
        else:
            self.showFullScreen(); self.settings['fullscreen'] = True
        save_settings(self.settings)

    # ── Menu Page ──────────────────────────────────────────────────────────────

    def _build_menu_page(self) -> QWidget:
        pg = QWidget(); pg.setStyleSheet("background:transparent;")
        lo = QVBoxLayout(pg); lo.setAlignment(Qt.AlignCenter); lo.setSpacing(sc(14))

        tl = QLabel("🃏 港式梭哈")
        tl.setStyleSheet(f"font-size:{sc(50)}px;font-weight:900;color:{C.GOLD};font-family:'Microsoft YaHei',Arial;letter-spacing:4px;")
        tl.setAlignment(Qt.AlignCenter)
        sl = QLabel("Hong Kong Stud Poker")
        sl.setStyleSheet(f"font-size:{sc(15)}px;color:{C.TEXT2};letter-spacing:5px;")
        sl.setAlignment(Qt.AlignCenter)
        lo.addStretch(); lo.addWidget(tl); lo.addWidget(sl); lo.addSpacing(sc(28))

        bw = QWidget(); bl = QVBoxLayout(bw); bl.setAlignment(Qt.AlignCenter); bl.setSpacing(sc(11))

        def mbtn(text, slot, primary=False, alt_color=None):
            btn = QPushButton(text); btn.setMinimumSize(sc(300), sc(52)); btn.setMaximumWidth(sc(380))
            bg = (alt_color or C.GOLD) if primary else C.BG_LIGHT
            fg = '#000' if primary else C.TEXT
            bd = (alt_color or C.GOLD) if not primary else 'transparent'
            btn.setStyleSheet(f"QPushButton{{background:{bg};color:{fg};font-size:{sc(14)}px;font-weight:bold;font-family:'Microsoft YaHei',Arial;border:2px solid {bd};border-radius:{sc(10)}px;padding:{sc(8)}px {sc(18)}px;min-height:{sc(38)}px;}} QPushButton:hover{{background:{QColor(bg).lighter(120).name()};}}")
            btn.setCursor(Qt.PointingHandCursor); btn.clicked.connect(slot); return btn

        bl.addWidget(mbtn("🎮  开始游戏", self._show_setup_dialog, primary=True), alignment=Qt.AlignCenter)

        self.resume_btn = mbtn("💾  继续游戏", self._load_game, primary=True, alt_color='#166534')
        self.resume_btn.setStyleSheet(self.resume_btn.styleSheet().replace('#166534', '#1a4a1a'))
        self.resume_btn.setVisible(load_save() is not None)
        bl.addWidget(self.resume_btn, alignment=Qt.AlignCenter)

        for text, slot in [("🤖  AI 自我训练", self._show_training_page),
                            ("🏆  排行榜",      self._show_leaderboard),
                            ("⚙️  设置",        self._show_settings),
                            ("📖  游戏规则",    self._show_rules),
                            ("❌  退出",        QApplication.quit)]:
            bl.addWidget(mbtn(text, slot), alignment=Qt.AlignCenter)

        lo.addWidget(bw); lo.addStretch()
        ft = QLabel("F1=规则  Ctrl+,=设置  F11=全屏  Ctrl+S=存档")
        ft.setStyleSheet(f"color:#374151;font-size:{sc(10)}px;"); ft.setAlignment(Qt.AlignCenter); lo.addWidget(ft)
        return pg

    # ── Game Page ──────────────────────────────────────────────────────────────

    def _build_game_page(self) -> QWidget:
        pg = QWidget(); pg.setStyleSheet("background:transparent;")
        outer = QVBoxLayout(pg); outer.setContentsMargins(sc(10),sc(5),sc(10),sc(5)); outer.setSpacing(sc(5))

        # Top bar
        tb = QHBoxLayout()
        self.round_lbl = QLabel("第 0 局"); self.round_lbl.setStyleSheet(f"color:{C.GOLD};font-size:{sc(14)}px;font-weight:bold;")
        self.phase_lbl = QLabel(""); self.phase_lbl.setStyleSheet(f"color:{C.TEXT2};font-size:{sc(12)}px;")
        self.pot_lbl = QLabel("底池: 0"); self.pot_lbl.setStyleSheet(f"color:{C.GOLD};font-size:{sc(16)}px;font-weight:bold;background:rgba(212,175,55,.1);padding:{sc(3)}px {sc(13)}px;border-radius:{sc(11)}px;border:1px solid #d4af3766;")

        def ib(txt, slot):
            b = QPushButton(txt); b.setStyleSheet(f"QPushButton{{background:{C.BG_LIGHT};color:{C.TEXT2};border:1px solid {C.BORDER};border-radius:{sc(5)}px;padding:{sc(2)}px {sc(9)}px;font-size:{sc(11)}px;}} QPushButton:hover{{background:{C.BORDER};color:{C.GOLD};}}")
            b.clicked.connect(slot); return b

        tb.addWidget(self.round_lbl); tb.addWidget(self.phase_lbl); tb.addStretch()
        tb.addWidget(self.pot_lbl); tb.addStretch()
        tb.addWidget(ib("统计", self._show_stats))
        tb.addWidget(ib("存档", self._save_game))
        tb.addWidget(ib("设置", self._show_settings))
        tb.addWidget(ib("菜单", self._return_to_menu))
        outer.addLayout(tb)

        # Content
        ct = QHBoxLayout(); ct.setSpacing(sc(9))
        self.left_panel = QVBoxLayout(); self.left_panel.setSpacing(sc(7)); self.left_panel.addStretch()
        ct.addLayout(self.left_panel, 2)
        cc = QVBoxLayout(); cc.setAlignment(Qt.AlignCenter)
        self.table_widget = TableWidget(); cc.addWidget(self.table_widget)
        ct.addLayout(cc, 3)
        self.right_panel = QVBoxLayout(); self.right_panel.setSpacing(sc(7)); self.right_panel.addStretch()
        ct.addLayout(self.right_panel, 2)
        outer.addLayout(ct, 1)

        # Bottom
        bf = QFrame(); bf.setStyleSheet(f"QFrame{{background:rgba(255,255,255,.02);border-top:1px solid {C.BORDER};}}")
        bot = QVBoxLayout(bf); bot.setContentsMargins(sc(10),sc(5),sc(10),sc(5)); bot.setSpacing(sc(4))

        self.human_panel_container = QHBoxLayout(); self.human_panel_container.setAlignment(Qt.AlignCenter)
        bot.addLayout(self.human_panel_container)

        self.hud = HUDWidget(); bot.addWidget(self.hud)

        af = QFrame(); af.setStyleSheet("background:transparent;")
        alo = QHBoxLayout(af); alo.setAlignment(Qt.AlignCenter); alo.setSpacing(sc(8))
        self.btn_fold  = ActionButton("弃牌 ✕",  C.DANGER,  'F')
        self.btn_check = ActionButton("过牌 ○",  C.BORDER,  'Space')
        self.btn_call  = ActionButton("跟注 →",  C.BLUE,    'C')
        self.btn_raise = ActionButton("加注 ↑",  C.GOLD,    'R')
        self.btn_allin = ActionButton("全押 ⚡",  C.PURPLE,  'A')
        self.btn_next  = ActionButton("下一局 ▶",C.GREEN,   'N')
        for btn in [self.btn_fold,self.btn_check,self.btn_call,self.btn_raise,self.btn_allin]:
            btn.setMinimumSize(sc(107),sc(46)); btn.setMaximumWidth(sc(145)); alo.addWidget(btn)
        self.btn_next.setMinimumSize(sc(128),sc(46)); self.btn_next.setMaximumWidth(sc(165)); alo.addSpacing(sc(14)); alo.addWidget(self.btn_next)
        self.btn_fold.clicked.connect(lambda: self._human_action(PlayerAction.FOLD))
        self.btn_check.clicked.connect(lambda: self._human_action(PlayerAction.CHECK))
        self.btn_call.clicked.connect(lambda: self._human_action(PlayerAction.CALL))
        self.btn_raise.clicked.connect(self._human_raise_dialog)
        self.btn_allin.clicked.connect(lambda: self._human_action(PlayerAction.ALL_IN))
        self.btn_next.clicked.connect(self._start_next_round)
        bot.addWidget(af)

        self.hk_hint = QLabel("快捷键:  F=弃牌  C/Space=过牌跟注  R=加注  A=全押  N=下一局  Ctrl+S=存档")
        self.hk_hint.setAlignment(Qt.AlignCenter); self.hk_hint.setStyleSheet(f"font-size:{sc(9)}px;color:#374151;")
        bot.addWidget(self.hk_hint)

        self.status_msg = QLabel("")
        self.status_msg.setAlignment(Qt.AlignCenter)
        self.status_msg.setTextFormat(Qt.RichText)
        self.status_msg.setFont(QFont('', sc(14)))
        self.status_msg.setStyleSheet(f"color:{C.GOLD};font-weight:bold;min-height:{sc(26)}px;padding:{sc(2)}px 0;")
        bot.addWidget(self.status_msg)
        outer.addWidget(bf)
        self._set_btns(False)
        return pg

    # ── Training Page ──────────────────────────────────────────────────────────

    def _build_training_page(self) -> QWidget:
        pg = QWidget(); pg.setStyleSheet("background:transparent;")
        lo = QVBoxLayout(pg); lo.setAlignment(Qt.AlignCenter); lo.setSpacing(sc(15)); lo.setContentsMargins(sc(40),sc(40),sc(40),sc(40))
        tl = QLabel("🤖 AI 自我训练"); tl.setStyleSheet(f"font-size:{sc(28)}px;font-weight:bold;color:{C.GOLD};"); tl.setAlignment(Qt.AlignCenter); lo.addWidget(tl)
        ds = QLabel("AI通过自我对弈进行强化学习 (Q-Learning + Monte Carlo)\n训练完成后模型自动保存，下次游戏时生效")
        ds.setStyleSheet(f"font-size:{sc(12)}px;color:{C.TEXT2};"); ds.setAlignment(Qt.AlignCenter); lo.addWidget(ds)
        gr = QHBoxLayout(); gr.setAlignment(Qt.AlignCenter)
        gl = QLabel("训练局数:"); gl.setStyleSheet(f"color:{C.TEXT};font-size:{sc(13)}px;")
        self.train_spin = QSpinBox(); self.train_spin.setRange(100,5000); self.train_spin.setValue(500); self.train_spin.setSingleStep(100)
        self.train_spin.setStyleSheet(f"QSpinBox{{background:{C.BG_LIGHT};color:{C.TEXT};border:1px solid {C.BORDER};border-radius:6px;padding:5px;font-size:{sc(13)}px;min-width:100px;}}")
        gr.addWidget(gl); gr.addWidget(self.train_spin); lo.addLayout(gr)
        self.train_pb = QProgressBar(); self.train_pb.setRange(0,100); self.train_pb.setValue(0); self.train_pb.setFixedWidth(sc(460))
        self.train_pb.setStyleSheet(f"QProgressBar{{background:{C.BG_LIGHT};border:1px solid {C.BORDER};border-radius:8px;height:{sc(18)}px;text-align:center;color:{C.TEXT};font-size:{sc(11)}px;}} QProgressBar::chunk{{background:{C.GOLD};border-radius:7px;}}")
        lo.addWidget(self.train_pb, alignment=Qt.AlignCenter)
        self.train_lbl = QLabel("准备就绪"); self.train_lbl.setStyleSheet(f"color:{C.TEXT2};font-size:{sc(12)}px;"); self.train_lbl.setAlignment(Qt.AlignCenter); lo.addWidget(self.train_lbl)
        br = QHBoxLayout(); br.setAlignment(Qt.AlignCenter); br.setSpacing(sc(14))
        self.train_btn = QPushButton("▶  开始训练"); self.train_btn.setMinimumSize(sc(155),sc(46))
        self.train_btn.setStyleSheet(f"QPushButton{{background:{C.GOLD};color:#000;font-size:{sc(13)}px;font-weight:bold;font-family:'Microsoft YaHei',Arial;border:none;border-radius:{sc(10)}px;padding:{sc(8)}px {sc(16)}px;min-height:{sc(38)}px;}} QPushButton:hover{{background:{C.GOLD_L};}} QPushButton:disabled{{background:{C.BORDER};color:#6b7280;}}")
        self.train_btn.setCursor(Qt.PointingHandCursor); self.train_btn.clicked.connect(self._start_training)
        bk = QPushButton("← 返回菜单"); bk.setMinimumSize(sc(155),sc(46))
        bk.setStyleSheet(f"QPushButton{{background:{C.BG_LIGHT};color:{C.TEXT2};font-size:{sc(13)}px;font-family:'Microsoft YaHei',Arial;border:1px solid {C.BORDER};border-radius:{sc(10)}px;padding:{sc(8)}px {sc(16)}px;min-height:{sc(38)}px;}} QPushButton:hover{{background:{C.BORDER};}}")
        bk.setCursor(Qt.PointingHandCursor); bk.clicked.connect(lambda: self.stack.setCurrentIndex(0))
        br.addWidget(self.train_btn); br.addWidget(bk); lo.addLayout(br)
        return pg

    # ── Setup Dialog ───────────────────────────────────────────────────────────

    def _show_setup_dialog(self):
        dlg = QDialog(self); dlg.setWindowTitle("游戏设置"); dlg.setModal(True); dlg.setFixedSize(sc(400),sc(360))
        dlg.setStyleSheet(f"QDialog{{background:{C.BG_MED};border:2px solid {C.BORDER};border-radius:{sc(12)}px;}} QLabel{{color:{C.TEXT};font-size:{sc(12)}px;}} QComboBox,QSpinBox,QLineEdit{{background:{C.BG_LIGHT};color:{C.TEXT};border:1px solid {C.BORDER};border-radius:6px;padding:5px;font-size:{sc(12)}px;min-width:145px;}} QComboBox QAbstractItemView{{background:{C.BG_LIGHT};color:{C.TEXT};selection-background-color:{C.BORDER};}}")
        lo = QVBoxLayout(dlg); lo.setContentsMargins(sc(22),sc(18),sc(22),sc(18)); lo.setSpacing(sc(11))
        tl = QLabel("🎮 新游戏设置"); tl.setStyleSheet(f"font-size:{sc(18)}px;font-weight:bold;color:{C.GOLD};"); tl.setAlignment(Qt.AlignCenter); lo.addWidget(tl)
        gr = QGridLayout(); gr.setSpacing(sc(9))
        cfg = self._game_config
        ne = QLineEdit(cfg.get('player_name','玩家'))
        cs = QSpinBox(); cs.setRange(200,10000); cs.setValue(cfg.get('starting_chips',1000)); cs.setSingleStep(200)
        ac = QComboBox()
        for n in ['1','2','3']: ac.addItem(f"{n} 位 AI 对手", n)
        ac.setCurrentIndex(cfg.get('num_ai',2)-1)
        dc = QComboBox()
        for d in ['新手','普通','高手','大师']: dc.addItem(d)
        dc.setCurrentIndex({'新手':0,'普通':1,'高手':2,'大师':3}.get(cfg.get('difficulty','普通'),1))
        ans = QSpinBox(); ans.setRange(5,200); ans.setValue(cfg.get('ante',10)); ans.setSingleStep(5)
        for i,(lbl,w) in enumerate([("玩家名称:",ne),("初始筹码:",cs),("AI对手数:",ac),("AI难度:",dc),("底注:",ans)]):
            ll = QLabel(lbl); ll.setStyleSheet(f"font-size:{sc(12)}px;color:{C.TEXT2};")
            gr.addWidget(ll,i,0); gr.addWidget(w,i,1)
        lo.addLayout(gr)
        dm = {'新手':'随机行动较多，容易击败','普通':'基础策略，适合入门','高手':'强力 + Monte Carlo 胜率估算','大师':'近乎最优，极难击败'}
        dd = QLabel(dm.get(dc.currentText(),''))
        dd.setStyleSheet(f"font-size:{sc(10)}px;color:#6b7280;font-style:italic;"); dd.setAlignment(Qt.AlignCenter)
        dc.currentTextChanged.connect(lambda t: dd.setText(dm.get(t,''))); lo.addWidget(dd)
        br = QHBoxLayout()
        can = QPushButton("取消"); can.setStyleSheet(f"background:{C.BORDER};color:{C.TEXT2};border:none;border-radius:{sc(8)}px;padding:{sc(7)}px {sc(16)}px;"); can.clicked.connect(dlg.reject)
        ok = QPushButton("开始游戏 ▶"); ok.setStyleSheet(f"background:{C.GOLD};color:#000;font-weight:bold;border:none;border-radius:{sc(8)}px;padding:{sc(7)}px {sc(16)}px;"); ok.clicked.connect(dlg.accept)
        br.addWidget(can); br.addWidget(ok); lo.addLayout(br)
        if dlg.exec_() == QDialog.Accepted:
            config = {'player_name':ne.text() or '玩家','starting_chips':cs.value(),'num_ai':int(ac.currentData()),'difficulty':dc.currentText(),'ante':ans.value()}
            self._game_config = config; self._setup_game(**config)

    def _setup_game(self, player_name, starting_chips, num_ai, difficulty, ante, **kw):
        self._clear_panels(); self.ai_players.clear(); self.all_players.clear()
        self.human_player = Player(player_name, starting_chips, is_human=True)
        self.all_players.append(self.human_player)
        for name in ["阿强","老K","小明","张三"][:num_ai]:
            p = Player(name, starting_chips)
            mp = "trained_ai.json" if os.path.exists("trained_ai.json") else f"ai_{name}.json"
            self.all_players.append(p); self.ai_players.append(AIPlayer(p,difficulty,mp))
        self.game = HKStudGame(self.all_players, ante=ante, min_bet=ante*2)
        self._build_panels(); self.stack.setCurrentIndex(1); self._start_round()

    # ── Panels ─────────────────────────────────────────────────────────────────

    def _build_panels(self):
        for lay in [self.left_panel, self.right_panel]:
            while lay.count():
                it = lay.takeAt(0)
                if it.widget(): it.widget().deleteLater()
        while self.human_panel_container.count():
            it = self.human_panel_container.takeAt(0)
            if it.widget(): it.widget().deleteLater()
        self.player_panels.clear()

        ais = [p for p in self.all_players if not p.is_human]
        n = len(ais)
        la = ais[:math.ceil(n/2)]
        ra = ais[math.ceil(n/2):]

        def add_side(layout, players):
            compact = len(players) >= 2
            for p in players:
                pn = PlayerPanel(p, compact=compact)
                self.player_panels[p.name] = pn
                layout.addWidget(pn)
            layout.addStretch()

        add_side(self.left_panel, la)
        add_side(self.right_panel, ra)

        hp = PlayerPanel(self.human_player, is_human=True)
        self.player_panels[self.human_player.name] = hp
        self.human_panel_container.addWidget(hp)
        self.table_widget.set_players(self.all_players)

    def _clear_panels(self):
        for p in self.player_panels.values(): p.deleteLater()
        self.player_panels.clear()

    # ── Round Flow ─────────────────────────────────────────────────────────────

    def _start_round(self):
        # ── Auto-replace broke AI players ──────────────────────────────────────
        cfg = self._game_config
        starting_chips = cfg.get('starting_chips', 1000)
        difficulty     = cfg.get('difficulty', '普通')
        ai_names_pool  = ["阿强", "老K", "小明", "张三", "阿明", "大炮", "铁头", "老李"]
        used_names = {p.name for p in self.all_players}

        replaced = []
        for i, ai in enumerate(list(self.ai_players)):
            if ai.player.chips <= 0:
                # Pick a fresh name
                fresh_name = next(
                    (n for n in ai_names_pool if n not in used_names),
                    f"AI-{self.game.round_num + 1}"
                )
                used_names.add(fresh_name)
                old_name = ai.player.name
                # Replace in all_players list
                idx = self.all_players.index(ai.player)
                new_player = Player(fresh_name, starting_chips, is_human=False)
                self.all_players[idx] = new_player
                mp = "trained_ai.json" if os.path.exists("trained_ai.json") else f"ai_{fresh_name}.json"
                new_ai = AIPlayer(new_player, difficulty, mp)
                self.ai_players[i] = new_ai
                replaced.append((old_name, fresh_name))

        if replaced:
            msgs = "、".join(f"{old}→{new}" for old, new in replaced)
            play_sfx('bust')
            self.status_msg.setText(f"<span style='color:#f59e0b;'>💸 {msgs} 破产，新玩家加入！</span>")
            # Rebuild game with updated player list (keep round number)
            rn = self.game.round_num
            self.game = HKStudGame(
                self.all_players,
                ante=cfg.get('ante', 10),
                min_bet=cfg.get('ante', 10) * 2
            )
            self.game.round_num = rn
            self._build_panels()
            # Brief pause so player sees the message, then continue
            QTimer.singleShot(1800, self._do_start_round)
            return

        self._do_start_round()

    def _do_start_round(self):
        alive = [p for p in self.all_players if p.chips > 0]

        # ── Human went bust → tournament over for the player ───────────────
        if self.human_player and self.human_player.chips <= 0:
            play_sfx('bust')
            add_leaderboard_entry(
                self.human_player.name, 0,
                self.game.round_num,
                self._game_config.get('difficulty','普通')
            )
            delete_save()
            best_ai = max(
                (p for p in self.all_players if not p.is_human),
                key=lambda p: p.chips, default=None
            )
            leader = f"\n当前领先: {best_ai.name} ({best_ai.chips:,} 筹码)" if best_ai else ""
            QMessageBox.information(
                self, "比赛结束",
                f"💸 你的筹码耗尽，比赛结束！\n\n"
                f"共完成 {self.game.round_num} 局{leader}\n\n"
                f"成绩已记录排行榜，再接再厉！"
            )
            self._return_to_menu()
            return

        # ── Only AIs left (shouldn't normally happen with auto-replace) ────
        if len(alive) < 2:
            winner = max(self.all_players, key=lambda p: p.chips)
            add_leaderboard_entry(winner.name, winner.chips,
                                  self.game.round_num,
                                  self._game_config.get('difficulty','普通'))
            delete_save()
            QMessageBox.information(
                self, "游戏结束",
                f"🏆 游戏结束!\n\n{winner.name} 获胜!\n"
                f"最终筹码: {winner.chips:,}\n共 {self.game.round_num} 局\n\n"
                f"成绩已记录排行榜!"
            )
            self._return_to_menu()
            return
        self._build_panels()
        self.game_running = True; self.btn_next.hide()
        self.game.start_round()
        play_sfx('deal')
        # Clear action badges from previous round
        for pn in self.player_panels.values(): pn.reset_action_badge()
        self._refresh_all()
        self.status_msg.setText(f"第 {self.game.round_num} 局开始")
        self.round_lbl.setText(f"第 {self.game.round_num} 局")
        self._process_next_step()

    def _process_next_step(self):
        if not self.game: return
        if self.game.phase in (GamePhase.ROUND_END, GamePhase.SHOWDOWN):
            self._handle_round_end(); return
        cp = self.game.players[self.game.active_player_idx]
        if self._betting_over(): return
        if cp.folded or cp.all_in:
            np = self.game.next_active_player()
            if np is None: self._advance_street(); return
            cp = np
        self.phase_lbl.setText(PHASE_NAMES.get(self.game.phase,''))
        if cp.is_human: self._enable_human_actions()
        else:
            self._set_btns(False)
            ai = next((a for a in self.ai_players if a.player is cp), None)
            if ai: self._run_ai(ai, cp)

    def _betting_over(self) -> bool:
        if self.game._is_betting_over(): self._advance_street(); return True
        return False

    def _run_ai(self, ai, player):
        self.status_msg.setText(f"<span style='color:{C.TEXT2};'>⏳ <b>{player.name}</b> 思考中...</span>")
        for pn in self.player_panels.values(): pn.set_active(pn.player is player); pn.refresh()
        QTimer.singleShot(self.settings['ai_speed'], lambda: self._exec_ai(ai, player))

    def _exec_ai(self, ai, player):
        if not self.game or player.folded: self._process_next_step(); return
        action, raise_to = ai.get_action(self.game)
        valid = self.game.get_valid_actions(player)
        if action not in valid: action = valid[0]
        for oa in self.ai_players:
            if oa is not ai:
                po = self.game.get_call_amount(player) / max(self.game.pot,1)
                oa.record_opponent_action(player.name, action, po, self.game.round_num)

        self.game.process_action(player, action, raise_to)

        # Sound effect
        sfx_map = {PlayerAction.FOLD:'fold', PlayerAction.CHECK:'check',
                   PlayerAction.CALL:'call', PlayerAction.RAISE:'raise',
                   PlayerAction.ALL_IN:'allin'}
        play_sfx(sfx_map.get(action, 'check'))

        # Trigger vivid action flash on the panel
        pn = self.player_panels.get(player.name)
        if pn: pn.flash_action(action, raise_to)

        # Dramatic status messages by action type
        color, badge = ACTION_STYLE.get(action, ('#9ca3af', '?'))
        if action == PlayerAction.FOLD:
            msg = f"<span style='color:#ef4444;font-weight:bold;'>{player.name} ❌ 弃牌</span>"
        elif action == PlayerAction.CHECK:
            msg = f"<span style='color:#9ca3af;'>{player.name} ○ 过牌</span>"
        elif action == PlayerAction.CALL:
            amt = self.game.get_call_amount(player) or player.bet_this_round
            msg = f"<span style='color:#60a5fa;font-weight:bold;'>{player.name} → 跟注</span>"
        elif action == PlayerAction.RAISE:
            msg = f"<span style='color:#f59e0b;font-size:{sc(16)}px;font-weight:bold;'>⚠ {player.name} ↑ 加注至 {raise_to}！</span>"
        elif action == PlayerAction.ALL_IN:
            msg = f"<span style='color:#a855f7;font-size:{sc(17)}px;font-weight:bold;'>💥 {player.name} 全押！⚡</span>"
        else:
            msg = f"{player.name}: {ACTION_NAMES[action]}"
        self.status_msg.setText(msg)

        self._refresh_all()
        if self.game.phase in (GamePhase.ROUND_END, GamePhase.SHOWDOWN): self._handle_round_end(); return
        if self._betting_over(): return
        np = self.game.next_active_player()
        if np is None: QTimer.singleShot(400, self._advance_street)
        else: QTimer.singleShot(300, self._process_next_step)

    def _advance_street(self):
        if not self.game: return
        po = [GamePhase.STREET_2,GamePhase.STREET_3,GamePhase.STREET_4,GamePhase.STREET_5]
        if self.game.phase in po:
            idx = po.index(self.game.phase)
            if idx+1 < len(po):
                self.game.phase = po[idx+1]; self.game._start_betting_street()
                self._refresh_all(); self.status_msg.setText(PHASE_NAMES.get(self.game.phase,''))
                QTimer.singleShot(300, self._process_next_step)
            else: self.game.do_showdown(); self._handle_round_end()
        else: self.game.do_showdown(); self._handle_round_end()

    def _handle_round_end(self):
        if not self.game: return
        if self.game.phase not in (GamePhase.ROUND_END, GamePhase.SHOWDOWN): self.game.do_showdown()
        for ai in self.ai_players: ai.end_episode(ai.player.chips); ai.save_model()
        self._refresh_all()
        for pw in self.game.winners:
            pn = self.player_panels.get(pw.name)
            if pn: pn.highlight_winner()
        if self.game.winners:
            names = ', '.join(p.name for p in self.game.winners)
            ih = any(p.is_human for p in self.game.winners)
            play_sfx('win')
            self.status_msg.setText("🎉 恭喜你赢得本局!" if ih else f"🤖 {names} 赢得本局")
        self._set_btns(False); self.waiting_for_human = False; self.btn_next.show()
        self._upd_hud(); self.game_running = False

    def _start_next_round(self):
        self.btn_next.hide()
        self._start_round()  # _start_round handles panel rebuild after AI replacement

    # ── Human Actions ──────────────────────────────────────────────────────────

    def _enable_human_actions(self):
        if not self.game or not self.human_player: return
        valid = self.game.get_valid_actions(self.human_player)
        ca = self.game.get_call_amount(self.human_player)
        self.btn_fold.setEnabled(PlayerAction.FOLD in valid)
        self.btn_check.setEnabled(PlayerAction.CHECK in valid)
        self.btn_call.setEnabled(PlayerAction.CALL in valid)
        self.btn_raise.setEnabled(PlayerAction.RAISE in valid)
        self.btn_allin.setEnabled(PlayerAction.ALL_IN in valid)
        self.btn_call.setText(f"跟注 {ca}" if ca > 0 else "跟注 →")
        sh = self.settings.get('show_hotkeys', True)
        for btn in [self.btn_fold,self.btn_check,self.btn_call,self.btn_raise,self.btn_allin]:
            btn.update_hotkey_hint(sh)
        for pn in self.player_panels.values(): pn.set_active(pn.player is self.human_player); pn.refresh()
        self.status_msg.setText("你的行动 — 请选择操作"); self.waiting_for_human = True; self._upd_hud()

    def _human_action(self, action):
        if not self.waiting_for_human or not self.game or not self.human_player: return
        valid = self.game.get_valid_actions(self.human_player)
        if action not in valid: return
        self.waiting_for_human = False; self._set_btns(False)
        self.game.process_action(self.human_player, action)
        play_sfx({PlayerAction.FOLD:'fold', PlayerAction.CHECK:'check',
                  PlayerAction.CALL:'call', PlayerAction.ALL_IN:'allin'}.get(action,'check'))
        pn = self.player_panels.get(self.human_player.name)
        if pn: pn.flash_action(action)
        self.status_msg.setText(f"你: {ACTION_NAMES[action]}"); self._refresh_all()
        if self.game.phase in (GamePhase.ROUND_END, GamePhase.SHOWDOWN): self._handle_round_end(); return
        if self._betting_over(): return
        np = self.game.next_active_player()
        if np is None: QTimer.singleShot(400, self._advance_street)
        else: QTimer.singleShot(200, self._process_next_step)

    def _human_raise_dialog(self):
        if not self.waiting_for_human or not self.game or not self.human_player: return
        p = self.human_player
        mn = self.game.get_min_raise_to(p); mx = p.chips + p.bet_this_round
        if mn > mx: self._human_action(PlayerAction.ALL_IN); return
        dlg = RaiseDialog(mn, mx, self.game.current_bet, self.game.pot, self)
        if dlg.exec_() == QDialog.Accepted:
            self.waiting_for_human = False; self._set_btns(False)
            self.game.process_action(p, PlayerAction.RAISE, dlg.raise_amount)
            play_sfx('raise')
            pn = self.player_panels.get(p.name)
            if pn: pn.flash_action(PlayerAction.RAISE, dlg.raise_amount)
            self.status_msg.setText(f"你: 加注至 {dlg.raise_amount}"); self._refresh_all()
            if self.game.phase in (GamePhase.ROUND_END, GamePhase.SHOWDOWN): self._handle_round_end(); return
            if self._betting_over(): return
            np = self.game.next_active_player()
            if np is None: QTimer.singleShot(400, self._advance_street)
            else: QTimer.singleShot(200, self._process_next_step)

    def _set_btns(self, e):
        for b in [self.btn_fold,self.btn_check,self.btn_call,self.btn_raise,self.btn_allin]: b.setEnabled(e)

    # ── HUD ────────────────────────────────────────────────────────────────────

    def _upd_hud(self):
        if not self.settings.get('show_hud',True) or not self.game or not self.human_player:
            self.hud.setVisible(False); return
        self.hud.setVisible(True)
        p = self.human_player
        ac = [c for c in p.cards if not c.face_up] + p.visible_cards()
        wp = quick_hand_strength(ac) if ac else 0.0
        ca = self.game.get_call_amount(p)
        po = ca / max(self.game.pot + ca, 1)
        hn = evaluate_hand(ac)[2] if ac else ''
        self.hud.update_info(wp, po, hn)

    # ── Refresh ────────────────────────────────────────────────────────────────

    def _refresh_all(self):
        if not self.game: return
        self.pot_lbl.setText(f"底池: {self.game.pot:,}")
        self.round_lbl.setText(f"第 {self.game.round_num} 局")
        self.phase_lbl.setText(PHASE_NAMES.get(self.game.phase,''))
        for pn in self.player_panels.values(): pn.refresh()
        self.table_widget.update_state(self.game); self._upd_hud()
        self.hk_hint.setVisible(self.settings.get('show_hotkeys',True))

    # ── Save / Load ────────────────────────────────────────────────────────────

    def _save_game(self):
        if not self.game or not self.human_player:
            if self.game_running: self.status_msg.setText("没有进行中的游戏"); return
            return
        data = {'config': self._game_config, 'round_num': self.game.round_num,
                'players': [{'name':p.name,'chips':p.chips,'is_human':p.is_human} for p in self.all_players]}
        write_save(data); self.resume_btn.setVisible(True)
        self.status_msg.setText("✅ 游戏已保存")
        QMessageBox.information(self,"存档","✅ 游戏进度已保存!\n下次可从菜单「继续游戏」读取。")

    def _load_game(self):
        data = load_save()
        if not data: QMessageBox.warning(self,"读取失败","没有找到存档。"); return
        try:
            cfg = data['config']
            cm  = {p['name']:p['chips'] for p in data['players']}
            cfg['starting_chips'] = cm.get(cfg.get('player_name','玩家'), cfg.get('starting_chips',1000))
            self._game_config = cfg; self._setup_game(**cfg)
            for p in self.all_players:
                if p.name in cm: p.chips = cm[p.name]
            self.game.round_num = data.get('round_num', 0)
            self._refresh_all(); self.status_msg.setText(f"✅ 存档读取成功 (第 {self.game.round_num} 局)")
        except Exception as e:
            QMessageBox.warning(self,"读取失败",f"存档文件损坏:\n{e}")

    # ── Navigation ─────────────────────────────────────────────────────────────

    def _return_to_menu(self):
        if self.game_running:
            reply = QMessageBox.question(self,"返回菜单","游戏进行中，确认返回?\n(可先保存进度)",
                                          QMessageBox.Save|QMessageBox.Yes|QMessageBox.No)
            if reply == QMessageBox.Save: self._save_game(); return
            if reply != QMessageBox.Yes: return
        for ai in self.ai_players: ai.save_model()
        self.game_running = False; self.waiting_for_human = False
        self.resume_btn.setVisible(load_save() is not None)
        self.stack.setCurrentIndex(0)

    def _show_training_page(self): self.stack.setCurrentIndex(2)

    def _show_stats(self):
        if not self.game: return
        StatsDialog(self.ai_players, self.game, self).exec_()

    def _show_leaderboard(self): LeaderboardDialog(self).exec_()

    def _show_settings(self):
        dlg = SettingsDialog(self.settings, self)
        dlg.applied.connect(self._on_settings)
        dlg.exec_()

    def _on_settings(self, ns):
        global _SCALE
        old_scale = self.settings.get('ui_scale', 1.0)
        self.settings = ns; _SCALE = ns['ui_scale']
        save_settings(ns)
        self._apply_window_settings()

        # If scale changed, rebuild all pages so sizes and fonts update
        if abs(old_scale - ns['ui_scale']) > 0.001:
            current_idx = self.stack.currentIndex()
            # Remove old pages
            while self.stack.count():
                w = self.stack.widget(0)
                self.stack.removeWidget(w)
                w.deleteLater()
            # Rebuild
            self.menu_page     = self._build_menu_page()
            self.game_page     = self._build_game_page()
            self.training_page = self._build_training_page()
            self.stack.addWidget(self.menu_page)
            self.stack.addWidget(self.game_page)
            self.stack.addWidget(self.training_page)
            # Return to menu (game state is lost on scale change anyway)
            self.game_running = False
            self.waiting_for_human = False
            self.stack.setCurrentIndex(0)
            # Re-hook HUD/hotkey refs to new widgets
        else:
            self.hud.setVisible(ns.get('show_hud', True))
            self.hk_hint.setVisible(ns.get('show_hotkeys', True))

    def _show_rules(self):
        dlg = QDialog(self); dlg.setWindowTitle("📖 游戏规则"); dlg.setModal(True); dlg.setFixedSize(520, 530)
        dlg.setStyleSheet(f"QDialog{{background:{C.BG_MED};}} QLabel{{color:{C.TEXT};}}")
        lo = QVBoxLayout(dlg); lo.setContentsMargins(18,14,18,14); lo.setSpacing(10)
        tl = QLabel("📖 港式梭哈规则"); tl.setStyleSheet(f"font-size:19px;font-weight:bold;color:{C.GOLD};"); tl.setAlignment(Qt.AlignCenter); lo.addWidget(tl)
        tx = QTextEdit(); tx.setReadOnly(True)
        tx.setStyleSheet(f"QTextEdit{{background:{C.BG_DARK};color:#e0e0e0;border:1px solid {C.BORDER};border-radius:8px;font-size:13px;font-family:'Microsoft YaHei',Arial;padding:8px;}}")
        tx.setHtml(f"""
<h3 style="color:{C.GOLD}">游戏目标</h3><p>持有最强5张牌组合赢取底池。</p>
<h3 style="color:{C.GOLD}">发牌顺序</h3>
<p>• 第1张：<b>暗牌</b>（只有自己可见）<br>• 第2-5张：依次发出<b>明牌</b>，每张后一轮下注<br>• 共4轮下注</p>
<h3 style="color:{C.GOLD}">下注规则</h3>
<p>• 持有<b>最大明牌</b>的玩家先行动（同点比花色：♠>♥>♦>♣）<br>• 加注后所有玩家须选择跟注、再加注或弃牌</p>
<h3 style="color:{C.GOLD}">行动快捷键</h3>
<p>• <b>F</b> = 弃牌　• <b>C / Space</b> = 过牌 / 跟注<br>• <b>R</b> = 加注（弹出滑块）　• <b>A</b> = 全押<br>• <b>N</b> = 下一局　• <b>F11</b> = 全屏　• <b>Ctrl+S</b> = 存档</p>
<h3 style="color:{C.GOLD}">牌型大小（从大到小）</h3>
<p><span style="color:{C.HIGHLIGHT}">皇家同花顺</span> &gt; <span style="color:{C.HIGHLIGHT}">同花顺</span> &gt; <span style="color:{C.HIGHLIGHT}">四条</span> &gt; <span style="color:{C.HIGHLIGHT}">葫芦</span> &gt; <span style="color:{C.HIGHLIGHT}">同花</span> &gt;<br>
<span style="color:{C.HIGHLIGHT}">顺子</span> &gt; <span style="color:{C.HIGHLIGHT}">三条</span> &gt; <span style="color:{C.HIGHLIGHT}">两对</span> &gt; <span style="color:{C.HIGHLIGHT}">一对</span> &gt; <span style="color:{C.HIGHLIGHT}">高牌</span></p>
<h3 style="color:{C.GOLD}">HUD 胜率说明</h3>
<p>• <b>绿色条</b>：胜率较高（>50%）<br>• <b>黄色条</b>：胜率中等（30-50%）<br>• <b>红色条</b>：胜率较低（<30%）<br>• <b>正EV ✓</b>：胜率 > 底池赔率，跟注有正期望值<br>• <b>负EV ✗</b>：胜率 < 底池赔率，跟注期望为负</p>
<h3 style="color:{C.GOLD}">AI 系统</h3>
<p>• Q-Learning + Monte Carlo 混合策略<br>• 随游戏局数自动学习，越玩越强<br>• 可通过「AI自我训练」提前强化 AI</p>
        """); lo.addWidget(tx)
        ok = QPushButton("关闭 (Esc)"); ok.setStyleSheet(f"QPushButton{{background:{C.GOLD};color:#000;font-weight:bold;border:none;border-radius:8px;padding:7px 22px;}} QPushButton:hover{{background:{C.GOLD_L};}}"); ok.clicked.connect(dlg.accept); lo.addWidget(ok, alignment=Qt.AlignCenter)
        dlg.exec_()

    def _show_about(self):
        QMessageBox.about(self,"关于港式梭哈",
            f"<h2 style='color:{C.GOLD}'>港式梭哈 v2.0</h2>"
            f"<p><b>AI:</b> Q-Learning + Monte Carlo + 对手建模</p>"
            f"<p><b>技术:</b> Python 3 · PyQt5</p>"
            f"<p><b>快捷键:</b> F1=规则 · Ctrl+,=设置 · F11=全屏 · Ctrl+S=存档</p>")

    # ── Training ───────────────────────────────────────────────────────────────

    def _start_training(self):
        self.train_btn.setEnabled(False); self.train_pb.setValue(0); self.train_lbl.setText("训练中...")
        self.train_thread = TrainingThread(self.train_spin.value())
        self.train_thread.progress.connect(self._on_train_prog)
        self.train_thread.finished.connect(self._on_train_done)
        self.train_thread.start()

    @pyqtSlot(int,int,str)
    def _on_train_prog(self, cur, tot, msg):
        self.train_pb.setValue(int(cur/max(tot,1)*100)); self.train_lbl.setText(f"已训练 {cur}/{tot} | {msg}")

    @pyqtSlot(str)
    def _on_train_done(self, msg):
        self.train_pb.setValue(100); self.train_lbl.setText(msg); self.train_btn.setEnabled(True)
        QMessageBox.information(self,"训练完成",f"✅ {msg}\n\nAI将在下次游戏中使用训练后的策略。")


# ─── Entry Point ──────────────────────────────────────────────────────────────

def main():
    app = QApplication(sys.argv)
    app.setApplicationName("港式梭哈"); app.setStyle('Fusion')

    # Set app-wide font with CJK support — this ensures all labels render Chinese correctly
    from PyQt5.QtGui import QFontDatabase
    cjk_font = None
    for candidate in ['Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC',
                      'Source Han Sans CN', 'WenQuanYi Micro Hei', 'SimHei']:
        if candidate in QFontDatabase().families():
            cjk_font = candidate; break
    base_font = QFont(cjk_font if cjk_font else 'Arial', 12)
    base_font.setStyleStrategy(QFont.PreferAntialias)
    app.setFont(base_font)

    # Initialize sound effects (generates small WAV tones in a temp directory)
    _init_sounds()
    pal = QPalette()
    pal.setColor(QPalette.Window,          QColor(C.BG_DARK))
    pal.setColor(QPalette.WindowText,      QColor(C.TEXT))
    pal.setColor(QPalette.Base,            QColor(C.BG_MED))
    pal.setColor(QPalette.AlternateBase,   QColor(C.BG_LIGHT))
    pal.setColor(QPalette.Text,            QColor(C.TEXT))
    pal.setColor(QPalette.Button,          QColor(C.BG_LIGHT))
    pal.setColor(QPalette.ButtonText,      QColor(C.TEXT))
    pal.setColor(QPalette.Highlight,       QColor(C.GOLD))
    pal.setColor(QPalette.HighlightedText, QColor('#000000'))
    app.setPalette(pal)
    w = MainWindow(); w.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()