import sys
import pandas as pd
import sympy as sp
from PyQt6.QtWidgets import *
from PyQt6.QtCore import Qt
from sympy.parsing.sympy_parser import (
    parse_expr, 
    standard_transformations, 
    implicit_multiplication_application
)

class MatrixDefineDialog(QDialog):
    def __init__(self, parent=None, initial_name="A"):
        super().__init__(parent)
        self.setWindowTitle(f"定义矩阵 - {initial_name}")
        self.resize(650, 550)
        layout = QVBoxLayout(self)

        # 状态标志：防止信号环路（修改 A 触发 B，B 又修改 A）
        self._block_auto_fill = False

        # --- 顶部设置栏 ---
        top = QHBoxLayout()
        self.name_input = QLineEdit(initial_name)
        self.rows_spin = QSpinBox()
        self.rows_spin.setRange(1, 50); self.rows_spin.setValue(3)
        self.cols_spin = QSpinBox()
        self.cols_spin.setRange(1, 50); self.cols_spin.setValue(3)
        
        # 新增：补全模式选择
        self.completion_mode = QComboBox()
        self.completion_mode.addItems(["无补全", "自动对称 (A=Aᵀ)", "自动反对称 (A=-Aᵀ)"])
        self.completion_mode.setToolTip("开启后，填写 a(i,j) 将自动尝试填充 a(j,i)")

        top.addWidget(QLabel("名称:"))
        top.addWidget(self.name_input)
        top.addWidget(QLabel("行/列:"))
        top.addWidget(self.rows_spin)
        top.addWidget(self.cols_spin)
        top.addWidget(QLabel("补全模式:"))
        top.addWidget(self.completion_mode)
        layout.addLayout(top)

        # 绑定尺寸变化
        self.rows_spin.valueChanged.connect(self.update_grid)
        self.cols_spin.valueChanged.connect(self.update_grid)

        # --- 提示标签 ---
        tip_label = QLabel("提示：补全功能仅在方阵且对应位置为空或为0时生效")
        tip_label.setStyleSheet("color: #e67e22; font-size: 11px; margin-bottom: 2px;")
        layout.addWidget(tip_label)

        # --- 矩阵表格 ---
        self.table = QTableWidget(3, 3)
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        # 核心：监听单元格修改
        self.table.itemChanged.connect(self.on_item_changed)
        layout.addWidget(self.table)

        # --- 工具栏 ---
        tool_layout = QHBoxLayout()
        btn_identity = QPushButton("单位矩阵")
        btn_identity.clicked.connect(self.make_identity)
        btn_clear = QPushButton("清空表格")
        btn_clear.clicked.connect(lambda: self.table.clearContents())
        self.btn_import = QPushButton("📁 导入文件")
        self.btn_import.clicked.connect(self.import_from_file)
        
        tool_layout.addWidget(btn_identity)
        tool_layout.addWidget(btn_clear)
        tool_layout.addStretch()
        tool_layout.addWidget(self.btn_import)
        layout.addLayout(tool_layout)

        # --- 底部确认按钮 ---
        self.btn_save = QPushButton("确认并保存到仓库")
        self.btn_save.clicked.connect(self.accept)
        self.btn_save.setStyleSheet("background-color: #27ae60; color: white; font-weight: bold; padding: 12px;")
        layout.addWidget(self.btn_save)

        self.update_grid()

    def update_grid(self):
        """实时响应 SpinBox 的变化"""
        self._block_auto_fill = True # 调整大小时不触发补全逻辑
        new_rows = self.rows_spin.value()
        new_cols = self.cols_spin.value()
        if self.table.rowCount() != new_rows: self.table.setRowCount(new_rows)
        if self.table.columnCount() != new_cols: self.table.setColumnCount(new_cols)
        self._block_auto_fill = False

    def on_item_changed(self, item):
        """核心功能：自动补全对称/反对称矩阵，并修复反对称对角元为零的Bug"""
        if self._block_auto_fill:
            return
        
        mode = self.completion_mode.currentIndex()
        if mode == 0: # 无补全模式
            return

        r, c = item.row(), item.column()
        # 补全功能仅在方阵时生效
        if self.rows_spin.value() != self.cols_spin.value():
            return

        val_text = item.text().strip()

        # --- 修复 Bug：反对称矩阵对角元强制为 0 ---
        if mode == 2 and r == c:
            if val_text != "0" and val_text != "":
                self._block_auto_fill = True
                self.table.setItem(r, c, QTableWidgetItem("0"))
                self._block_auto_fill = False
                # 可选：可以弹出一个状态栏提示或小气泡告知用户
                # print("反对称矩阵对角元必须为 0")
            return

        # 如果修改的是对角线（且是模式1），或者值为空，则不进行跨单元格补全
        if r == c or not val_text:
            return

        # --- 跨位置补全逻辑 a(i,j) -> a(j,i) ---
        target_item = self.table.item(c, r)
        target_text = target_item.text().strip() if target_item else ""

        # 判定条件：a(j, i) 为空或为 "0" 时才补全
        if target_text == "" or target_text == "0":
            self._block_auto_fill = True
            
            try:
                if mode == 1: # 对称：A[j,i] = A[i,j]
                    self.table.setItem(c, r, QTableWidgetItem(val_text))
                
                elif mode == 2: # 反对称：A[j,i] = -A[i,j]
                    if val_text.startswith('-'):
                        new_text = val_text[1:]
                    elif val_text == "0":
                        new_text = "0"
                    else:
                        # 自动处理符号表达式，添加必要括号
                        new_text = f"-({val_text})" if any(op in val_text for op in "+-*/") else f"-{val_text}"
                    self.table.setItem(c, r, QTableWidgetItem(new_text))
            except Exception:
                pass
            
            self._block_auto_fill = False

    def make_identity(self):
        self._block_auto_fill = True
        r, c = self.rows_spin.value(), self.cols_spin.value()
        self.table.clearContents()
        for i in range(min(r, c)):
            self.table.setItem(i, i, QTableWidgetItem("1"))
        self._block_auto_fill = False

    def import_from_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "导入", "", "Files (*.xlsx *.csv *.txt)")
        if not file_path: return
        try:
            self._block_auto_fill = True
            if file_path.endswith('.csv'): df = pd.read_csv(file_path, header=None)
            elif file_path.endswith(('.xlsx', '.xls')): df = pd.read_excel(file_path, header=None)
            else: df = pd.read_csv(file_path, header=None, sep=r'\s+|,', engine='python')
            
            self.rows_spin.setValue(df.shape[0]); self.cols_spin.setValue(df.shape[1])
            self.update_grid()
            for r in range(df.shape[0]):
                for c in range(df.shape[1]):
                    val = str(df.iloc[r, c])
                    if val.lower() != 'nan': self.table.setItem(r, c, QTableWidgetItem(val))
            self._block_auto_fill = False
        except Exception as e:
            QMessageBox.critical(self, "导入失败", str(e))
            self._block_auto_fill = False

    def get_data(self):
        name = self.name_input.text().strip() or "M"
        data = []
        transformations = standard_transformations + (implicit_multiplication_application,)
        for i in range(self.table.rowCount()):
            row = []
            for j in range(self.table.columnCount()):
                item = self.table.item(i, j)
                text = item.text().strip() if item and item.text().strip() else "0"
                try:
                    val = parse_expr(text, transformations=transformations)
                except Exception:
                    val = sp.Integer(0)
                row.append(val)
            data.append(row)
        return name, sp.Matrix(data)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    dialog = MatrixDefineDialog()
    if dialog.exec():
        print(dialog.get_data())
    sys.exit()