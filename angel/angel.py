import numpy as np
import matplotlib.pyplot as plt

filename=r"E:\programming_works\angel\output\motor_speed.txt"
#参数
flu=500
dt=1/flu

#读取数据
omega = np.loadtxt(filename)
time =np.arange(len(omega))*dt
#绘图
plt.figure (figsize=(10,5))
plt.plot(time,omega,color='b',linewidth=1.2)
plt.title("Estimated Moto Angular Velocity")
plt.xlabel("Time(s)")
plt.ylabel("Angular Velocity (rad/s)")
plt.grid(True, linestyle='--',alpha=0.5)
plt.tight_layout()

plt.savefig("motor_speed.jpg", dpi=300)
plt.show()