import csv
import sys
import random
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QLabel, QLineEdit, 
                             QTabWidget, QMessageBox, QFrame,QFileDialog)
from PyQt6.QtCore import (Qt, QRectF, QPropertyAnimation, pyqtProperty, 
                          QEasingCurve, QParallelAnimationGroup, QPointF)
from PyQt6.QtGui import QPainter, QColor, QPen, QFont, QBrush

# --- 1. 逻辑引擎 ---
class GeneratorEngine:
    @staticmethod
    def gen_int(start, end, count=1):
        # 使用列表推导式生成多个
        nums = [random.randint(min(start, end), max(start, end)) for _ in range(count)]
        return nums

    @staticmethod
    def gen_float(start, end, precision=2, count=1):
        nums = [round(random.uniform(start, end), precision) for _ in range(count)]
        return nums

    @staticmethod
    def gen_complex(re_range, im_range, precision=2, count=1):
        nums = []
        for _ in range(count):
            re = random.uniform(re_range[0], re_range[1])
            im = random.uniform(im_range[0], im_range[1])
            nums.append(complex(round(re, precision), round(im, precision)))
        return nums

# --- 2. 核心绘图画布 (增强版动画与标注) ---
class GameCanvas(QFrame):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setMinimumSize(400, 400)
        self.setStyleSheet("background-color: #ffffff; border: 2px solid #dcdde1; border-radius: 10px;")
        self.setMouseTracking(True)
        
        self.mode = "INT"
        self.target = 0
        
        # 逻辑边界
        self._min_re, self._max_re = -100.0, 100.0
        self._min_im, self._max_im = -100.0, 100.0
        
        # 视野边界 (动画控制的对象)
        self._v_min_re, self._v_max_re = -100.0, 100.0
        self._v_min_im, self._v_max_im = -100.0, 100.0
        
        self.is_running = False
        self.hover_pos = None
        self.hover_val = None

    # --- 动画属性 ---
    @pyqtProperty(float)
    def v_min_re(self): return self._v_min_re
    @v_min_re.setter
    def v_min_re(self, v): self._v_min_re = v; self.update()

    @pyqtProperty(float)
    def v_max_re(self): return self._v_max_re
    @v_max_re.setter
    def v_max_re(self, v): self._v_max_re = v; self.update()

    @pyqtProperty(float)
    def v_min_im(self): return self._v_min_im
    @v_min_im.setter
    def v_min_im(self, v): self._v_min_im = v; self.update()

    @pyqtProperty(float)
    def v_max_im(self): return self._v_max_im
    @v_max_im.setter
    def v_max_im(self, v): self._v_max_im = v; self.update()

    def update_range(self, n_min_re, n_max_re, n_min_im, n_max_im):
        self._min_re, self._max_re = n_min_re, n_max_re
        self._min_im, self._max_im = n_min_im, n_max_im
        
        from PyQt6.QtCore import QParallelAnimationGroup
        self.para_group = QParallelAnimationGroup()
        
        props = [
            ("v_min_re", n_min_re), ("v_max_re", n_max_re),
            ("v_min_im", n_min_im), ("v_max_im", n_max_im)
        ]
        
        for prop, val in props:
            anim = QPropertyAnimation(self, prop.encode())
            anim.setDuration(700)
            anim.setEndValue(float(val))
            anim.setEasingCurve(QEasingCurve.Type.OutExpo)
            self.para_group.addAnimation(anim)
        
        self.para_group.start()

    def paintEvent(self, event):
        if not self.is_running: return
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        padding = 60.0 
        w, h = float(self.width() - 2*padding), float(self.height() - 2*padding)
        
        def to_px_x(val):
            v_range = self._v_max_re - self._v_min_re
            return padding + (float(val) - self._v_min_re) / v_range * w if v_range != 0 else padding

        def to_px_y(val):
            v_range = self._v_max_im - self._v_min_im
            return (padding + h) - (float(val) - self._v_min_im) / v_range * h if v_range != 0 else padding

        # --- 1. 动态背景网格 ---
        painter.setPen(QPen(QColor(240, 240, 240), 1))
        view_width = self._v_max_re - self._v_min_re
        if view_width > 100: step = 20
        elif view_width > 20: step = 10
        else: step = 2 

        start_re = int(self._v_min_re // step * step)
        end_re = int(self._v_max_re // step * step + step)
        for val in range(start_re, end_re, int(step)):
            px = to_px_x(val)
            if padding <= px <= padding + w:
                painter.drawLine(int(px), int(padding), int(px), int(padding + h))

        if self.mode == "COMPLEX":
            start_im = int(self._v_min_im // step * step)
            end_im = int(self._v_max_im // step * step + step)
            for val in range(start_im, end_im, int(step)):
                py = to_px_y(val)
                if padding <= py <= padding + h:
                    painter.drawLine(int(padding), int(py), int(padding + w), int(py))

        # --- 2. 绘制主体 ---
        if self.mode == "INT":
            y_mid = self.height() / 2.0
            x_start = to_px_x(self._min_re)
            x_end = to_px_x(self._max_re)
            painter.setPen(QPen(QColor("#ecf0f1"), 10, Qt.PenStyle.SolidLine, Qt.PenCapStyle.RoundCap))
            painter.drawLine(int(padding), int(y_mid), int(padding + w), int(y_mid))
            painter.setPen(QPen(QColor("#3498db"), 10, Qt.PenStyle.SolidLine, Qt.PenCapStyle.RoundCap))
            painter.drawLine(int(x_start), int(y_mid), int(x_end), int(y_mid))
            painter.setPen(QPen(QColor("#2c3e50")))
            painter.setFont(QFont("Arial", 10, QFont.Weight.Bold))
            painter.drawText(int(x_start)-20, int(y_mid + 30), str(int(self._min_re)))
            painter.drawText(int(x_end)-10, int(y_mid + 30), str(int(self._max_re)))

        elif self.mode == "COMPLEX":
            x1, x2 = to_px_x(self._min_re), to_px_x(self._max_re)
            y1, y2 = to_px_y(self._min_im), to_px_y(self._max_im)
            rect = QRectF(x1, y2, x2 - x1, y1 - y2)
            painter.setPen(QPen(QColor("#e74c3c"), 2))
            painter.setBrush(QBrush(QColor(231, 76, 60, 60)))
            painter.drawRect(rect)
            painter.setPen(QPen(QColor("#c0392b")))
            painter.setFont(QFont("Consolas", 9))
            painter.drawText(int(x1)-40, int(rect.center().y()), str(int(self._min_re)))
            painter.drawText(int(x2)+5, int(rect.center().y()), str(int(self._max_re)))
            painter.drawText(int(rect.center().x()), int(y2)-10, f"{int(self._max_im)}i")
            painter.drawText(int(rect.center().x()), int(y1)+20, f"{int(self._min_im)}i")

        # 悬停气泡
        if self.hover_pos and self.hover_val:
            painter.setPen(Qt.PenStyle.NoPen)
            painter.setBrush(QColor(44, 62, 80, 220))
            tw = painter.fontMetrics().boundingRect(self.hover_val).width()
            bubble = QRectF(self.hover_pos.x() + 15, self.hover_pos.y() - 35, tw + 15, 25)
            painter.drawRoundedRect(bubble, 5, 5)
            painter.setPen(Qt.GlobalColor.white)
            painter.drawText(bubble, Qt.AlignmentFlag.AlignCenter, self.hover_val)

    def mouseMoveEvent(self, event):
        if not self.is_running: return
        self.hover_pos = event.position()
        padding = 60.0
        w, h = float(self.width() - 2*padding), float(self.height() - 2*padding)
        lx = self._v_min_re + ((self.hover_pos.x() - padding) / w) * (self._v_max_re - self._v_min_re)
        ly = self._v_min_im + ((padding + h - self.hover_pos.y()) / h) * (self._v_max_im - self._v_min_im)
        self.hover_val = str(int(round(lx))) if self.mode == "INT" else f"{int(round(lx))}, {int(round(ly))}i"
        self.update()

# --- 3. 游戏容器 ---
# --- 修改后的 DigitBombWidget 类 ---
class DigitBombWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.canvas = GameCanvas()
        self.guess_count = 0  # 初始化计数器
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout(self)
        
        # 范围设置区域
        range_layout = QHBoxLayout()
        self.min_input = QLineEdit("-100")
        self.max_input = QLineEdit("100")
        for inp in [self.min_input, self.max_input]:
            inp.setFixedWidth(60)
            inp.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        range_layout.addStretch()
        range_layout.addWidget(QLabel("范围从:"))
        range_layout.addWidget(self.min_input)
        range_layout.addWidget(QLabel("到:"))
        range_layout.addWidget(self.max_input)
        range_layout.addStretch()

        # 状态显示区
        self.status_label = QLabel("设置范围后选择模式开始游戏")
        self.status_label.setStyleSheet("color: #2c3e50; font-weight: bold; font-size: 14px;")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # --- 新增：步数显示标签 ---
        self.count_label = QLabel("当前步数: 0")
        self.count_label.setStyleSheet("color: #e67e22; font-weight: bold;")
        self.count_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        btns = QHBoxLayout()
        b1 = QPushButton("模式: 整数"); b2 = QPushButton("模式: 复数")
        for b in [b1, b2]: 
            b.setFixedHeight(40)
            b.setStyleSheet("background: #2ecc71; color: white; border-radius: 5px; font-weight: bold;")
            btns.addWidget(b)
        b1.clicked.connect(lambda: self.start_game("INT"))
        b2.clicked.connect(lambda: self.start_game("COMPLEX"))
        
        layout.addLayout(range_layout)
        layout.addWidget(self.status_label)
        layout.addWidget(self.count_label) # 添加到布局
        layout.addLayout(btns)
        layout.addWidget(self.canvas)
        
    def start_game(self, mode):
        try:
            start_val = float(self.min_input.text())
            end_val = float(self.max_input.text())
            if start_val >= end_val: raise ValueError
        except:
            QMessageBox.critical(self, "设置错误", "请输入有效的数字范围")
            return

        # 重置计数器
        self.guess_count = 0
        self.count_label.setText("当前步数: 0")
        
        self.canvas.mode = mode
        self.canvas.is_running = True
        rng = [start_val, end_val, start_val, end_val]
        self.canvas._min_re, self.canvas._max_re, self.canvas._min_im, self.canvas._max_im = rng
        self.canvas._v_min_re, self.canvas._v_max_re, self.canvas._v_min_im, self.canvas._v_max_im = rng
        
        if mode == "INT":
            self.canvas.target = random.randint(int(start_val), int(end_val))
        else:
            self.canvas.target = complex(random.randint(int(start_val), int(end_val)), 
                                        random.randint(int(start_val), int(end_val)))
        
        self.status_label.setText(f"目标已隐藏，请点击画布猜测！")
        self.canvas.update()

    def mousePressEvent(self, event):
        if not self.canvas.is_running: return
        lp = self.canvas.mapFrom(self, event.pos())
        if not self.canvas.rect().contains(lp): return
        
        # --- 增加计数并更新显示 ---
        self.guess_count += 1
        self.count_label.setText(f"当前步数: {self.guess_count}")
        
        padding = 60.0
        w, h = float(self.canvas.width() - 2*padding), float(self.canvas.height() - 2*padding)
        click_re = round(self.canvas._v_min_re + ((lp.x() - padding) / w) * (self.canvas._v_max_re - self.canvas._v_min_re))
        click_im = round(self.canvas._v_min_im + ((padding + h - lp.y()) / h) * (self.canvas._v_max_im - self.canvas._v_min_im))
        
        n_re_min, n_re_max = self.canvas._min_re, self.canvas._max_re
        n_im_min, n_im_max = self.canvas._min_im, self.canvas._max_im

        if self.canvas.mode == "INT":
            if click_re == self.canvas.target:
                QMessageBox.warning(self, "BOOM!!!", f"爆炸！总共用了 {self.guess_count} 步。\n数字是: {int(self.canvas.target)}")
                self.start_game("INT"); return
            
            if click_re < self.canvas.target: n_re_min = click_re + 1
            else: n_re_max = click_re - 1
            
            if n_re_min == n_re_max:
                self.canvas.update_range(n_re_min, n_re_max, n_im_min, n_im_max)
                QMessageBox.critical(self, "绝杀！", f"已锁定炸弹！总步数: {self.guess_count}\n炸弹就是: {int(n_re_min)}")
                self.start_game("INT"); return
        else:
            # 复数模式逻辑
            is_hit_re = (click_re == self.canvas.target.real)
            is_hit_im = (click_im == self.canvas.target.imag)
            if is_hit_re and is_hit_im:
                QMessageBox.warning(self, "BOOM!!!", f"复数炸弹爆炸！步数: {self.guess_count}\n位置: {int(self.canvas.target.real)} + {int(self.canvas.target.imag)}i")
                self.start_game("COMPLEX"); return

            if click_re < self.canvas.target.real: n_re_min = click_re + 1
            elif click_re > self.canvas.target.real: n_re_max = click_re - 1
            if click_im < self.canvas.target.imag: n_im_min = click_im + 1
            elif click_im > self.canvas.target.imag: n_im_max = click_im - 1

            if n_re_min == n_re_max and n_im_min == n_im_max:
                self.canvas.update_range(n_re_min, n_re_max, n_im_min, n_im_max)
                QMessageBox.critical(self, "绝杀！", f"空间已锁死！步数: {self.guess_count}\n坐标: {int(n_re_min)} + {int(n_im_min)}i")
                self.start_game("COMPLEX"); return

        self.canvas.update_range(n_re_min, n_re_max, n_im_min, n_im_max)

# --- 4. 主窗口 ---
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("数字助手 - 动画增强版")
        self.resize(600, 850)
        self.tabs = QTabWidget()
        self.setCentralWidget(self.tabs)
        self.init_generator_tab()
        self.tabs.addTab(DigitBombWidget(), "数字炸弹小游戏")

    def init_generator_tab(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        self.res_label = QLabel("READY")
        self.res_label.setStyleSheet("font-size: 32px; color: #2980b9; background: #f8f9fa; border-radius: 10px; padding: 30px;")
        self.res_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        inputs = QHBoxLayout()
        self.low_in = QLineEdit("-100"); self.high_in = QLineEdit("100"); self.prec_in = QLineEdit("2")
        self.count_in = QLineEdit("1") # 新增：数量输入
        inputs.addWidget(QLabel("最小:")); inputs.addWidget(self.low_in)
        inputs.addWidget(QLabel("最大:")); inputs.addWidget(self.high_in)
        inputs.addWidget(QLabel("小数位:")); inputs.addWidget(self.prec_in)
        inputs.addWidget(QLabel("生成数量:")) # 标签
        inputs.addWidget(self.count_in)    # 输入框
        self.res_label.setWordWrap(True)
        
        btn_box = QHBoxLayout()
        b_int = QPushButton("生成整数"); b_float = QPushButton("生成小数"); b_comp = QPushButton("生成复数")
        for b in [b_int, b_float, b_comp]: 
            b.setStyleSheet("background: #3498db; color: white; padding: 10px; font-weight: bold; border-radius: 5px;")
            btn_box.addWidget(b)
        b_int.clicked.connect(lambda: self.generate("INT"))
        b_float.clicked.connect(lambda: self.generate("FLOAT"))
        b_comp.clicked.connect(lambda: self.generate("COMPLEX"))
        
        layout.addStretch(); layout.addWidget(self.res_label); layout.addLayout(inputs); layout.addLayout(btn_box); layout.addStretch()
        self.tabs.addTab(widget, "随机数生成器")

        # 新增：导出按钮
        self.export_btn = QPushButton("导出为文件 (CSV/TXT)")
        self.export_btn.setStyleSheet("background: #e67e22; color: white; padding: 10px; font-weight: bold; border-radius: 5px;")
        self.export_btn.clicked.connect(self.export_data)
        self.export_btn.setEnabled(False) # 初始不可用，生成数据后再启用

        # 将导出按钮添加到布局（可以单独一行或放在 btn_box 里）
        layout.addStretch()
        layout.addWidget(self.res_label)
        layout.addLayout(inputs)
        layout.addLayout(btn_box)
        layout.addWidget(self.export_btn) # 添加导出按钮
        layout.addStretch()
        
        # 用来存储最近一次生成的原始列表数据
        self.current_data = []

    def export_data(self):
        if not self.current_data:
            return

        # 弹出文件保存对话框
        file_path, _ = QFileDialog.getSaveFileName(
            self, "导出数据", "", "CSV 文件 (*.csv);;文本文件 (*.txt)"
        )

        if file_path:
            try:
                if file_path.endswith('.csv'):
                    with open(file_path, 'w', newline='', encoding='utf-8') as f:
                        writer = csv.writer(f)
                        writer.writerow(["Index", "Value"])
                        for i, val in enumerate(self.current_data):
                            # 复数在 CSV 中保存为字符串
                            writer.writerow([i + 1, str(val).replace('(', '').replace(')', '')])
                else:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        for val in self.current_data:
                            f.write(str(val).replace('(', '').replace(')', '') + '\n')
                
                QFileDialog.getExistingDirectory # 仅为提示，实际使用下方的消息框
                QMessageBox.information(self, "成功", f"数据已成功导出至:\n{file_path}")
            except Exception as e:
                QMessageBox.critical(self, "导出失败", f"错误详情: {str(e)}")


    def generate(self, mode):
        try:
            l, h = float(self.low_in.text()), float(self.high_in.text())
            p = int(self.prec_in.text())
            c = int(self.count_in.text()) # 获取数量
            
            if c < 1: c = 1
            if c > 100: c = 100 # 安全限制，防止渲染太多文字卡顿
            
            engine = GeneratorEngine()
            if mode == "INT": res_list = engine.gen_int(int(l), int(h), c)
            elif mode == "FLOAT": res_list = engine.gen_float(l, h, p, c)
            else: res_list = engine.gen_complex((l,h), (l,h), p, c)
            
            # 保存到实例变量供导出使用
            self.current_data = res_list
            self.export_btn.setEnabled(True) # 启用导出按钮

            # 将列表转换为字符串显示，用逗号分隔
            display_text = ", ".join([str(x).replace('(','').replace(')','') for x in res_list])
            
            # 根据字符长度动态调整字体大小，防止溢出
            if len(display_text) > 50:
                self.res_label.setStyleSheet("font-size: 18px; color: #2980b9; background: #f8f9fa; border-radius: 10px; padding: 20px;")
            else:
                self.res_label.setStyleSheet("font-size: 32px; color: #2980b9; background: #f8f9fa; border-radius: 10px; padding: 30px;")
                
            self.res_label.setText(display_text)
            
        except ValueError:
            QMessageBox.critical(self, "错误", "请输入有效的数字和生成数量")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    win = MainWindow()
    win.show()
    sys.exit(app.exec())