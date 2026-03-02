import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# 1. 设置数据范围
x = np.linspace(-2, 2, 400)
y = np.linspace(-2, 2, 400)
X, Y = np.meshgrid(x, y)
Z = np.cos(2 * X + Y)

# 2. 创建画布
fig = plt.figure(figsize=(14, 6))

# --- 子图 1: 3D 略图 ---
ax1 = fig.add_subplot(1, 2, 1, projection='3d')
surf = ax1.plot_surface(X, Y, Z, cmap='viridis', alpha=0.8, edgecolor='none')
ax1.set_title('Surface Plot of z = cos(2x + y)')
ax1.set_xlabel('x')
ax1.set_ylabel('y')
ax1.set_zlabel('z')

# --- 子图 2: 等高线图 ---
ax2 = fig.add_subplot(1, 2, 2)
# 指定题目要求的 z 值：0, ±1, ±1/2
levels = [-1, -0.5, 0, 0.5, 1]
contours = ax2.contour(X, Y, Z, levels=levels, colors='black')

# 给等高线标上数值
plt.clabel(contours, inline=True, fontsize=10, fmt='%1.1f')

ax2.set_title('Contour Lines for z = 0, ±1, ±0.5')
ax2.set_xlabel('x')
ax2.set_ylabel('y')
ax2.grid(True, linestyle='--', alpha=0.6)

plt.tight_layout()
plt.show()