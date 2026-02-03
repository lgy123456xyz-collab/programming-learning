import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker

def math_normalize_angle(angle):
    pi = np.pi
    a = np.mod(angle + pi, 2.0 * pi)
    return a - pi

# 1. 准备数据
chassis_angles = np.linspace(-np.pi, np.pi, 1000)

# 原始逻辑：可能会产生 1.5pi 或 -1.5pi
y_raw = [math_normalize_angle(-0.5 * np.pi - a) + a for a in chassis_angles]

# 修改后的逻辑：通过二次 Normalize，将 1.5pi 转化为 -0.5pi
y_fixed = [math_normalize_angle(val) for val in y_raw]

# 2. 绘图
fig, ax = plt.subplots(figsize=(12, 7), dpi=150)

# 绘制原始路径 (虚线)
ax.plot(chassis_angles, y_raw, label='Raw Logic (can reach $\pm 1.5\pi$)', 
        color='gray', linestyle='--', alpha=0.5)

# 绘制优化路径 (实线)
ax.plot(chassis_angles, y_fixed, label='Fixed Logic (max $\pm\pi$)', 
        color='#e67e22', linewidth=2.5)

# 3. 设置刻度 (y轴 0.25pi)
ax.yaxis.set_major_locator(ticker.MultipleLocator(0.25 * np.pi))
ax.xaxis.set_major_locator(ticker.MultipleLocator(0.5 * np.pi))

def pi_formatter(x, pos):
    if np.isclose(x, 0): return "0"
    return f"{x/np.pi:g}$\pi$"

ax.xaxis.set_major_formatter(plt.FuncFormatter(pi_formatter))
ax.yaxis.set_major_formatter(plt.FuncFormatter(pi_formatter))

# 4. 修饰
ax.set_title("Angle Redirection: From $1.5\pi$ to $-0.5\pi$", fontsize=15)
ax.set_xlabel("Chassis Angle", fontsize=12)
ax.set_ylabel("Final Output Angle", fontsize=12)
ax.grid(True, linestyle=':', alpha=0.7)
ax.legend()

# 保存文件
output_file = "angle_fixed_05pi.png"
plt.savefig(output_file)
print(f"图像已保存至: {output_file}")

plt.show()