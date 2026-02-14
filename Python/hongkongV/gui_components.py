from PyQt6.QtWidgets import QWidget, QHBoxLayout, QSlider, QLabel
from PyQt6.QtCore import Qt, pyqtSignal


class BetSlider(QWidget):
    """PyQt6 版本的加注滑动条，发出 valueChanged(int) 信号，并提供 set_max/value 方法。"""
    valueChanged = pyqtSignal(int)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setStyleSheet("background: #111;")
        self.layout = QHBoxLayout(self)
        self.layout.setContentsMargins(4, 4, 4, 4)

        self.slider = QSlider(Qt.Orientation.Horizontal)
        self.slider.setMinimum(10)
        self.slider.setMaximum(1000)
        self.slider.setValue(10)
        self.slider.setFixedWidth(260)
        self.slider.valueChanged.connect(self._on_change)

        self.label = QLabel("加注: +$10")
        self.label.setStyleSheet("color: #f1c40f;")

        self.layout.addWidget(self.slider)
        self.layout.addWidget(self.label)

    def _on_change(self, val: int):
        self.label.setText(f"加注: ${val}")
        self.valueChanged.emit(val)

    def set_max(self, max_val: int):
        self.slider.setMaximum(max(10, max_val))

    def value(self) -> int:
        return self.slider.value()