import plotly.graph_objects as go
import numpy as np

# 1. 生成参数网格
# u 对应 x 轴（从 -2π 到 2π）
u = np.linspace(-2 * np.pi, 2 * np.pi, 100)
# v 对应绕 x 轴旋转的角度（0 到 2π）
v = np.linspace(0, 2 * np.pi, 60)
u, v = np.meshgrid(u, v)

# 2. 根据方程 y^2 + z^2 = sin^2(x) 计算空间坐标
# 这里的半径 r = abs(sin(x))
x = u
y = np.sin(u) * np.cos(v)
z = np.sin(u) * np.sin(v)

# 3. 创建 3D 绘图
fig = go.Figure(data=[go.Surface(
    x=x, y=y, z=z, 
    colorscale='Teal',    # 修正：使用了正确的内置色标 'Teal'
    showscale=False,      # 隐藏右侧颜色条
    opacity=0.9,          # 设置一点透明度更有立体感
    lighting=dict(        # 优化光照效果，让它看起来更像 Mathematica 的质感
        ambient=0.6,
        diffuse=0.5,
        fresnel=0.2,
        specular=0.5,
        roughness=0.1
    )
)])

# 4. 设置布局和交互选项
fig.update_layout(
    title='y² + z² = sin²(x) 的可交互 3D 图像',
    scene=dict(
        xaxis_title='X 轴',
        yaxis_title='Y 轴',
        zaxis_title='Z 轴',
        aspectmode='data', # 确保坐标轴比例 1:1:1，不缩放变形
        camera=dict(
            eye=dict(x=1.5, y=1.5, z=0.8) # 设置初始视角
        )
    ),
    margin=dict(l=0, r=0, b=0, t=50)
)

# 5. 运行显示
# 这将启动一个本地临时服务器并在浏览器打开图像
fig.show()