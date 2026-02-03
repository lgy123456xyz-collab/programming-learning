import pickle
import os
import sys
import sympy as sp
from PyQt6.QtWidgets import *
from PyQt6.QtGui import QFont
from PyQt6.QtCore import Qt
from PyQt6.QtWebEngineWidgets import QWebEngineView
import pandas as pd
# 确保以下模块在同一目录下
from matrix_manager import MatrixDefineDialog
import matrix_operations as ops
import matrix_decompositions as decomp
from latex_renderer import sympy_to_html, sympy_to_pretty

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Matrix Lab Pro - 符号/数值双模工作站")
        self.resize(1150, 850)
        self.matrix_store = {}
        self.current_raw_res = None
        self.initUI()
        
        # 启动时加载历史数据
        self.load_from_disk()

    def initUI(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QHBoxLayout(central)

        # --- 左侧：矩阵仓库增强 ---
        left = QVBoxLayout()
        
        # 新增：搜索和清空布局
        search_layout = QHBoxLayout()
        self.search_bar = QLineEdit()
        self.search_bar.setPlaceholderText("🔍 搜索矩阵...")
        self.search_bar.textChanged.connect(self.filter_matrices) # 连接过滤逻辑
        
        btn_clear_all = QPushButton("清空")
        btn_clear_all.setFixedWidth(50)
        btn_clear_all.clicked.connect(self.clear_all_matrices) # 连接清空逻辑
        btn_clear_all.setStyleSheet("background-color: #ffebee; color: #c62828;")
        
        search_layout.addWidget(self.search_bar)
        search_layout.addWidget(btn_clear_all)
        left.addLayout(search_layout)

        left.addWidget(QLabel("<b>矩阵仓库 (右键管理)</b>"))
        self.var_list = QListWidget()


        self.var_list.setMouseTracking(True)
        self.var_list.itemEntered.connect(self.show_preview)
        # --- 新增：开启右键菜单功能 ---
        self.var_list.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)
        self.var_list.customContextMenuRequested.connect(self.show_right_click_menu)
        left.addWidget(self.var_list)
        
        btn_new = QPushButton("+ 定义新矩阵")
        btn_new.clicked.connect(self.add_matrix)
        btn_new.setStyleSheet("padding: 10px; font-weight: bold; background-color: #f0f7ff;")
        left.addWidget(btn_new)
        layout.addLayout(left, 1)

        # --- 右侧：主操作区 ---
        right = QVBoxLayout()

        # 1. 显示模式选择
        mode_box = QGroupBox("显示偏好")
        mode_layout = QHBoxLayout()
        self.radio_exact = QRadioButton("精确解 (符号 & 分数)")
        self.radio_approx = QRadioButton("近似解 (数值)")
        self.radio_exact.setChecked(True)
        self.radio_exact.toggled.connect(self.refresh_display)
        mode_layout.addWidget(self.radio_exact)
        mode_layout.addWidget(self.radio_approx)
        mode_box.setLayout(mode_layout)
        right.addWidget(mode_box)
        
        # 2. 核心运算按钮 (包含伴随矩阵)
        op_box = QGroupBox("核心运算")
        grid = QGridLayout()
        self.cb_a = QComboBox(); self.cb_b = QComboBox()
        grid.addWidget(QLabel("选择 A:"), 0, 0); grid.addWidget(self.cb_a, 0, 1)
        grid.addWidget(QLabel("选择 B:"), 1, 0); grid.addWidget(self.cb_b, 1, 1)
        
        btn_configs = [
            ("A + B", "add"), ("A × B", "mul"), 
            ("逆 A⁻¹", "inv"), ("转置 Aᵀ", "trans"),
            ("伴随 A*", "adj") # 伴随矩阵
        ]
        for i, (txt, cmd) in enumerate(btn_configs):
            b = QPushButton(txt)
            b.clicked.connect(lambda ch, c=cmd: self.do_op(c))
            grid.addWidget(b, i//2, i%2 + 2)
        op_box.setLayout(grid)
        right.addWidget(op_box)

        # --- 基础属性 (针对 A) ---
        prop_box = QGroupBox("高级属性 (针对 A)")
        prop_layout = QGridLayout() # 改用网格布局更整齐
        
        props = [
            ("行列式 |A|", "det"), ("秩 Rank(A)", "rank"), 
            ("迹 Trace(A)", "trace"), ("特征多项式", "char_poly"),
            ("判断正定性", "is_positive_definite")
        ]
        
        for i, (txt, cmd) in enumerate(props):
            b = QPushButton(txt)
            b.clicked.connect(lambda ch, c=cmd: self.do_op(c))
            prop_layout.addWidget(b, i // 3, i % 3) # 每行 3 个
            
        prop_box.setLayout(prop_layout)
        right.addWidget(prop_box)
        
        # 4. 矩阵分解按钮 (针对 A)
        dec_box = QGroupBox("矩阵分解 (针对 A)")
        dec_layout = QHBoxLayout()
        for m in ['LU', 'QR', 'EIGEN', 'SVD', 'CONGRUENT']:
            b = QPushButton(m)
            b.clicked.connect(lambda ch, mode=m: self.do_dec(mode))
            dec_layout.addWidget(b)
        dec_box.setLayout(dec_layout)
        right.addWidget(dec_box)

        # 5. 结果显示区
        res_header = QHBoxLayout()
        res_header.addWidget(QLabel("<b>结果显示区域:</b>"))
        self.btn_switch = QPushButton("切换显示模式 (网页/字符画)")
        self.btn_switch.setFixedWidth(200)
        self.btn_switch.clicked.connect(self.toggle_display_mode)
        res_header.addWidget(self.btn_switch)
        right.addLayout(res_header)

        self.res_stack = QStackedWidget()
        self.res_browser = QWebEngineView()
        self.res_browser.setStyleSheet("border: 1px solid #ccc; background: white;")
        self.res_text = QTextEdit()
        self.res_text.setReadOnly(True)
        self.res_text.setFont(QFont("Consolas", 11))
        self.res_text.setStyleSheet("border: 1px solid #ccc; background: #fdfdfd;")
        self.res_stack.addWidget(self.res_browser)
        self.res_stack.addWidget(self.res_text)
        right.addWidget(self.res_stack)

        # 6. 保存当前结果
        save_layout = QHBoxLayout()
        self.save_name = QLineEdit("ANS")
        btn_save = QPushButton("存入仓库")
        btn_save.clicked.connect(self.save_result)
        save_layout.addWidget(QLabel("保存结果为:"))
        save_layout.addWidget(self.save_name); save_layout.addWidget(btn_save)
        right.addLayout(save_layout)

        layout.addLayout(right, 3)

    # --- 逻辑控制方法 ---

    def toggle_display_mode(self):
        self.res_stack.setCurrentIndex(1 - self.res_stack.currentIndex())
        self.refresh_display()

    def process_val(self, val):
        if hasattr(val, 'evalf') and self.radio_approx.isChecked():
            # 尝试化简后转换为数值
            try:
                return sp.simplify(val).evalf(n=6)
            except:
                return val.evalf(n=6)
        return val

    def refresh_display(self):
        if self.current_raw_res is None: return
        try:
            # 1. 处理错误字符串
            if isinstance(self.current_raw_res, str):
                self.res_text.setText(self.current_raw_res)
                self.res_browser.setHtml(f"<h3 style='color:red;'>{self.current_raw_res}</h3>")
                return

            # 2. 统一数据格式
            if isinstance(self.current_raw_res, dict):
                # 处理分解出来的字典（如 L, U）
                display_data = {k: v.applyfunc(self.process_val) if hasattr(v, 'applyfunc') else self.process_val(v) 
                                for k, v in self.current_raw_res.items()}
            elif hasattr(self.current_raw_res, 'applyfunc'):
                # 处理单矩阵
                display_data = self.current_raw_res.applyfunc(self.process_val)
            else:
                # 处理标量（行列式、秩等）
                display_data = self.process_val(sp.sympify(self.current_raw_res))

            # 3. 执行渲染
            if self.res_stack.currentIndex() == 0:
                self.res_browser.setHtml(sympy_to_html(display_data))
            else:
                self.res_text.setText(sympy_to_pretty(display_data))
        except Exception as e:
            self.res_text.setText(f"显示异常: {e}")

    def add_matrix(self):
        suggested = chr(65 + len(self.matrix_store)) if len(self.matrix_store) < 26 else f"M{len(self.matrix_store)}"
        diag = MatrixDefineDialog(self, suggested)
        if diag.exec():
            name, m = diag.get_data()
            self.matrix_store[name] = m
            if name not in [self.var_list.item(i).text() for i in range(self.var_list.count())]:
                self.var_list.addItem(name); self.cb_a.addItem(name); self.cb_b.addItem(name)
            self.current_raw_res = m
            self.refresh_display()

    def do_op(self, cmd):
        a_name = self.cb_a.currentText()
        b_name = self.cb_b.currentText()
        if not a_name: return
        self.current_raw_res = ops.perform_op(cmd, self.matrix_store, [a_name, b_name])
        self.refresh_display()

    def do_dec(self, mode):
        a_name = self.cb_a.currentText()
        if not a_name: return
        
        # 1. 设置忙碌状态
        QApplication.setOverrideCursor(Qt.CursorShape.WaitCursor)
        try:
            # 2. 执行耗时计算
            res = decomp.decompose(mode, self.matrix_store[a_name])
            self.current_raw_res = res
            self.refresh_display()
        finally:
            # 3. 务必恢复光标
            QApplication.restoreOverrideCursor()

    def save_result(self):
        # 获取用户输入的名称，支持逗号或空格分隔
        raw_names = self.save_name.text().replace(',', ' ').split()
        
        if not self.current_raw_res:
            QMessageBox.warning(self, "提示", "当前没有运算结果可保存")
            return

        # 情况 A：结果是字典（如分解产生的 {'L': ..., 'U': ...}）
        if isinstance(self.current_raw_res, dict):
            # 获取字典里的所有矩阵
            matrices = list(self.current_raw_res.values())
            keys = list(self.current_raw_res.keys())
            
            for i, name in enumerate(raw_names):
                if i < len(matrices):
                    m = matrices[i]
                    self._update_store(name.strip(), m)
                else:
                    break
            QMessageBox.information(self, "成功", f"已按顺序保存前 {min(len(raw_names), len(matrices))} 个矩阵")

        # 情况 B：结果是单个矩阵
        elif isinstance(self.current_raw_res, sp.Matrix):
            name = raw_names[0] if raw_names else "ANS"
            self._update_store(name, self.current_raw_res)
            QMessageBox.information(self, "成功", f"矩阵 {name} 已存入仓库")
        
        else:
            QMessageBox.warning(self, "提示", "当前结果不是矩阵格式，无法保存")

    def _update_store(self, name, matrix):
        """辅助函数：更新仓库并同步 UI"""
        self.matrix_store[name] = matrix
        # 检查是否已在列表中，不在则添加
        existing_items = [self.var_list.item(i).text() for i in range(self.var_list.count())]
        if name not in existing_items:
            self.var_list.addItem(name)
            self.cb_a.addItem(name)
            self.cb_b.addItem(name)

    def show_preview(self, item):
        name = item.text()
        m = self.matrix_store.get(name)
        if m: item.setToolTip(f"[{name}]:\n{sp.pretty(m, use_unicode=True)}")

    # --- 存档逻辑 ---
    def save_to_disk(self):
        try:
            with open("matrix_data.pkl", "wb") as f:
                pickle.dump(self.matrix_store, f)
        except Exception as e:
            QMessageBox.critical(self, "保存失败", str(e))

    def load_from_disk(self):
        if os.path.exists("matrix_data.pkl"):
            try:
                with open("matrix_data.pkl", "rb") as f:
                    self.matrix_store = pickle.load(f)
                for name in self.matrix_store.keys():
                    self.var_list.addItem(name)
                    self.cb_a.addItem(name)
                    self.cb_b.addItem(name)
            except:
                pass

    def closeEvent(self, event):
        if not self.matrix_store:
            event.accept()
            return
        reply = QMessageBox.question(self, '退出', "是否保存当前的矩阵变量？",
                                     QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No | QMessageBox.StandardButton.Cancel)
        if reply == QMessageBox.StandardButton.Yes:
            self.save_to_disk(); event.accept()
        elif reply == QMessageBox.StandardButton.No:
            event.accept()
        else:
            event.ignore()


    def show_right_click_menu(self, pos):
        """弹出右键菜单"""
        item = self.var_list.itemAt(pos)
        if not item: return
        
        menu = QMenu()
        action_rename = menu.addAction("重命名")
        action_delete = menu.addAction("删除")
        action_export = menu.addAction("导出为 CSV")
        
        # 获取点击位置的全局坐标并弹出
        action = menu.exec(self.var_list.mapToGlobal(pos))
        
        name = item.text()
        if action == action_rename:
            self.rename_matrix(name)
        elif action == action_delete:
            self.delete_matrix(name)
        elif action == action_export:
            self.export_to_csv(name)

    def rename_matrix(self, old_name):
        """重命名矩阵逻辑"""
        new_name, ok = QInputDialog.getText(self, "重命名", f"将 '{old_name}' 重命名为:", QLineEdit.EchoMode.Normal, old_name)
        if ok and new_name.strip() and new_name != old_name:
            new_name = new_name.strip()
            # 1. 更新存储字典
            self.matrix_store[new_name] = self.matrix_store.pop(old_name)
            # 2. 更新列表显示
            self.sync_ui_with_store()
            QMessageBox.information(self, "成功", f"已重命名为 {new_name}")

    def delete_matrix(self, name):
        """删除矩阵逻辑"""
        reply = QMessageBox.question(self, '确认删除', f"确定要从仓库中删除矩阵 '{name}' 吗？",
                                     QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            # 1. 从存储移除
            if name in self.matrix_store:
                del self.matrix_store[name]
            # 2. 同步 UI
            self.sync_ui_with_store()

    def export_to_csv(self, name):
        """导出为 CSV 文件"""
        m = self.matrix_store.get(name)
        if not m: return
        
        file_path, _ = QFileDialog.getSaveFileName(self, "导出 CSV", f"{name}.csv", "CSV Files (*.csv)")
        if file_path:
            try:
                import csv
                with open(file_path, 'w', newline='') as f:
                    writer = csv.writer(f)
                    # 将 SymPy 矩阵转为列表嵌套形式写入
                    for row in range(m.rows):
                        writer.writerow([str(val) for val in m.row(row)])
                QMessageBox.information(self, "导出成功", f"矩阵已保存至: {file_path}")
            except Exception as e:
                QMessageBox.critical(self, "错误", f"导出失败: {e}")

    def sync_ui_with_store(self):
        """辅助函数：让列表和下拉框与 matrix_store 保持完全一致"""
        self.var_list.clear()
        self.cb_a.clear()
        self.cb_b.clear()
        for name in sorted(self.matrix_store.keys()):
            self.var_list.addItem(name)
            self.cb_a.addItem(name)
            self.cb_b.addItem(name)

    # --- 新增：过滤逻辑 ---
    def filter_matrices(self, text):
        for i in range(self.var_list.count()):
            item = self.var_list.item(i)
            item.setHidden(text.lower() not in item.text().lower())

    # --- 新增：一键清空 ---
    def clear_all_matrices(self):
        if not self.matrix_store: return
        reply = QMessageBox.question(self, '确认', "确定要清空仓库吗？", 
                                     QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            self.matrix_store.clear()
            self.sync_ui_with_store()

    # --- 升级：右键菜单支持多格式导出 ---
    def show_right_click_menu(self, pos):
        item = self.var_list.itemAt(pos)
        if not item: return
        name = item.text()
        
        menu = QMenu()
        menu.addAction("重命名", lambda: self.rename_matrix(name))
        menu.addAction("删除", lambda: self.delete_matrix(name))
        
        export_menu = menu.addMenu("导出为...")
        export_menu.addAction("Excel (.xlsx)", lambda: self.export_advanced(name, "Excel"))
        export_menu.addAction("Text (.txt)", lambda: self.export_advanced(name, "Text"))
        export_menu.addAction("CSV (.csv)", lambda: self.export_advanced(name, "CSV"))
        
        menu.exec(self.var_list.mapToGlobal(pos))

    # --- 新增：高级导出逻辑 ---
    def export_advanced(self, name, fmt):
        m = self.matrix_store.get(name)
        if not m: return
        
        ext_map = {"Excel": "xlsx", "Text": "txt", "CSV": "csv"}
        file_path, _ = QFileDialog.getSaveFileName(self, f"导出 {fmt}", f"{name}.{ext_map[fmt]}", f"{fmt} Files (*.{ext_map[fmt]})")
        
        if not file_path: return
        
        try:
            # 转换为普通列表（字符串化处理符号）
            data = [[str(val) for val in m.row(r)] for r in range(m.rows)]
            
            if fmt == "Excel":
                pd.DataFrame(data).to_excel(file_path, index=False, header=False)
            elif fmt == "CSV":
                pd.DataFrame(data).to_csv(file_path, index=False, header=False)
            elif fmt == "Text":
                with open(file_path, 'w', encoding='utf-8') as f:
                    # 导出美化的字符画格式
                    f.write(f"Matrix {name}:\n")
                    f.write(sp.pretty(m))
            
            QMessageBox.information(self, "成功", f"矩阵已导出至: {file_path}")
        except Exception as e:
            QMessageBox.critical(self, "导出失败", f"错误详情: {e}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec())