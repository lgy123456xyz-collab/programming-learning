import sympy as sp
import numpy as np
from PyQt6.QtCore import QThread, pyqtSignal

class EigenWorker(QThread):
    """
    专门处理特征值分解与 Jordan 分解的异步线程。
    确保返回结果中只有矩阵对象，避免 UI 保存逻辑因读取到提示字符串而崩溃。
    """
    finished = pyqtSignal(object)  # 成功信号，传递结果字典
    error = pyqtSignal(str)        # 错误信号

    def __init__(self, matrix):
        super().__init__()
        self.matrix = matrix

    def run(self):
        try:
            # 1. 获取特征向量数据 (特征值, 重数, 向量列表)
            # simplify=False 可显著提高处理带分数/符号矩阵的稳定性
            eigen_data = self.matrix.eigenvects(simplify=False)
            
            all_vecs = []
            diag_elements = []
            
            for val, mult, vecs in eigen_data:
                for v in vecs:
                    all_vecs.append(v)
                    diag_elements.append(val)
            
            res = {}
            # 2. 判定：如果线性无关向量数等于阶数，执行标准对角化
            if len(all_vecs) == self.matrix.rows:
                res["P"] = sp.Matrix.hstack(*all_vecs)
                res["D"] = sp.diag(*diag_elements)
                res["_type"] = "Diagonalization" # 内部标记，不建议保存
            else:
                # 3. 核心改进：若不可对角化，计算 Jordan 分解 (A = P*J*P^-1)
                # jordan_form 返回 (P, J)，其中 P 是广义特征向量矩阵，J 是 Jordan 标准型
                P_jordan, J = self.matrix.jordan_form()
                res["P_jordan"] = P_jordan
                res["J"] = J
                res["_type"] = "JordanForm"
            
            self.finished.emit(res)
        except Exception as e:
            self.error.emit(f"分解执行失败: {str(e)}")

def decompose(mode, M):
    """
    同步矩阵分解路由。
    针对 EIGEN 模式，同样引入 Jordan 分解作为保底。
    """
    try:
        # 判定是否为纯数值矩阵（无符号变量）
        is_all_numeric = len(M.free_symbols) == 0
        
        # --- SVD 分解 ---
        if mode == 'SVD':
            if is_all_numeric:
                M_np = np.array(M.tolist(), dtype=np.float64)
                U_np, S_vec, Vh_np = np.linalg.svd(M_np)
                return {
                    "U": sp.Matrix(U_np).applyfunc(lambda x: round(x, 6)),
                    "S": sp.Matrix(np.diag(S_vec)).applyfunc(lambda x: round(x, 6)),
                    "V_h": sp.Matrix(Vh_np).applyfunc(lambda x: round(x, 6))
                }
            else:
                # 符号模式下 Matrix.singular_value_decomposition() 较为耗时
                U, S, V = M.singular_value_decomposition()
                return {"U": U, "S": S, "V": V}

        # --- LU 分解 ---
        elif mode == 'LU':
            L, U, _ = M.LUdecomposition()
            return {"L": L, "U": U}
        
        # --- QR 分解 ---
        elif mode == 'QR':
            Q, R = M.QRdecomposition()
            return {"Q": Q, "R": R}
            
        # --- 特征分解 (同步保底逻辑) ---
        elif mode == 'EIGEN':
            try:
                # 尝试标准对角化
                P, D = M.diagonalize()
                return {"P": P, "D": D}
            except:
                # 若失败（不可对角化或计算超时），强制转为 Jordan 标准型
                Pj, J = M.jordan_form()
                return {"P_jordan": Pj, "J": J}

        # --- 合同分解 (针对对称阵) ---
        elif mode == 'CONGRUENT':
            if not M.is_symmetric():
                # 返回一个包含错误信息的矩阵，避免破坏保存逻辑
                return {"Error": sp.Matrix([sp.Symbol("Matrix_Not_Symmetric")])}
            L, D = M.LDLdecomposition()
            return {"L": L, "D": D}

        return {"Error": sp.Matrix([sp.Symbol("Unknown_Mode")])}

    except Exception as e:
        # 发生异常时，将异常信息包装为 SymPy 符号矩阵返回
        return {"Exception": sp.Matrix([sp.Symbol(str(e).replace(' ', '_'))])}