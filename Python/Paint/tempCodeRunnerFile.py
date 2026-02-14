import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# 设置坐标范围
x = np.linspace(-2, 2, 60)
y = np.linspace(-2, 2, 60)
X, Y = np.meshgrid(x, y)

# 计算两个曲面的 Z 值
# 1. 题目中的曲面
Z1 = X * Y

# 2. 标准形式的马鞍面 (取 a=1, b=1 为例)
# 为了方便对比，我们将其缩放至相近的比例
Z2 = (X**2 - Y**2) / 2

# 开始绘图
fig = plt.figure(figsize=(14, 6))

# 设置统一的材质（颜色映射）
my_cmap = plt.get_cmap('viridis') # 使用与原图类似的翠绿色调材质

# 子图 1: z = xy
ax1 = fig.add_subplot(121, projection='3d')
surf1 = ax1.plot_surface(X, Y, Z1, cmap=my_cmap, edgecolor='k', linewidth=0.1, alpha=0.9)
ax1.set_title('$z = xy$', fontsize=15)
ax1.set_zlim(-2, 2)

# 子图 2: z = (x^2 - y^2) / 2 (标准形式)
ax2 = fig.add_subplot(122, projection='3d')
surf2 = ax2.plot_surface(X, Y, Z2, cmap=my_cmap, edgecolor='k', linewidth=0.1, alpha=0.9)
ax2.set_title('$z = \\frac{x^2 - y^2}{2}$', fontsize=15)
ax2.set_zlim(-2, 2)

# 统一视角以便对比
for ax in [ax1, ax2]:
    ax.view_init(elev=25, azim=-45)
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')

plt.tight_layout()
plt.show()