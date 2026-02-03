import sympy as sp

def perform_op(cmd, store, vars):
    a_name = vars[0]
    if a_name not in store: return "请先选择矩阵"
    A = store[a_name]
    
    try:
        if cmd == "add":
            b_name = vars[1]
            return A + store[b_name]
        elif cmd == "mul":
            b_name = vars[1]
            return A * store[b_name]
        elif cmd == "inv":
            return A.inv()
        elif cmd == "trans":
            return A.T
        elif cmd == "adj":  # 新增伴随矩阵
            return A.adjugate()
        # 新增标量属性计算
        elif cmd == "det":
            return A.det()
        elif cmd == "rank":
            return sp.Integer(A.rank())
        elif cmd == "trace":
            return A.trace()
        elif cmd == "char_poly":
            # 获取特征多项式，默认变量为 lambda (用字母 lamda 避免关键字冲突)
            lamda = sp.symbols('λ')
            return A.charpoly(lamda).as_expr()
            
        elif cmd == "is_positive_definite":
            if not A.is_symmetric():
                return "矩阵非对称，无法按照常规标准判断正定性（通常指对称矩阵）。"
            # 判断是否正定：所有特征值均大于 0
            # 或者使用 A.is_positive_definite (SymPy 1.10+)
            try:
                if A.is_positive_definite:
                    return "该矩阵是 [正定矩阵] (Positive Definite)"
                elif A.is_positive_semi_definite:
                    return "该矩阵是 [半正定矩阵] (Positive Semi-definite)"
                else:
                    return "该矩阵 [不是正定/半正定矩阵]"
            except:
                # 备用方案：检查特征值
                eigs = list(A.eigenvals().keys())
                if all(e > 0 for e in eigs): return "该矩阵是 [正定矩阵]"
                return "该矩阵 [不是正定矩阵]"

    except Exception as e:
        return f"运算错误: {str(e)}"