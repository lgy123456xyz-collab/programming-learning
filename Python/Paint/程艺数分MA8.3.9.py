import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# 创建画布
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

# 1. 设置数据范围
# 注意：根据 x^2 = y^2 + z^2，x 的绝对值必须大于 y
u = np.linspace(-1, 1, 100)
v = np.linspace(-1, 1, 100)
U, V = np.meshgrid(u, v)

# 2. 绘制曲面 1: x^2 + y^2 + 4z^2 = 1 (椭球面)
# z^2 = (1 - x^2 - y^2) / 4
Z1_sq = (1 - U**2 - V**2) / 4
Z1_sq[Z1_sq < 0] = np.nan  # 过滤非法值
Z1 = np.sqrt(Z1_sq)

ax.plot_surface(U, V, Z1, alpha=0.3, color='cyan')
ax.plot_surface(U, V, -Z1, alpha=0.3, color='cyan')

# 3. 绘制曲面 2: x^2 = y^2 + z^2 (圆锥面)
# z^2 = x^2 - y^2
Z2_sq = U**2 - V**2
Z2_sq[Z2_sq < 0] = np.nan
Z2 = np.sqrt(Z2_sq)

ax.plot_surface(U, V, Z2, alpha=0.3, color='orange')
ax.plot_surface(U, V, -Z2, alpha=0.3, color='orange')

# 4. 绘制交线 (投影柱面: 5x^2 - 3y^2 = 1)
# 我们通过参数化交线来绘制它
y_line = np.linspace(-1, 1, 400)
x_line_pos = np.sqrt((1 + 3*y_line**2) / 5)
x_line_neg = -x_line_pos

# 计算对应的 z 值 (从 z^2 = x^2 - y^2 得到)
z_line_pos = np.sqrt(x_line_pos**2 - y_line**2)
z_line_neg = -z_line_pos

# 绘制四条交线分支
for x_val in [x_line_pos, x_line_neg]:
    for z_val in [z_line_pos, z_line_neg]:
        ax.plot(x_val, y_line, z_val, color='red', lw=3)

# 设置标签
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.set_title('Intersection of Ellipsoid and Cone')

plt.show()