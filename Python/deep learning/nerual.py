import numpy as np
import matplotlib.pyplot as plt
def step_function(x):
    y=x>0
    return y.astype(int)
x=np.array([-1.0,1.0,2.0])
print(x)
y=x>0
print(y)
print(step_function(x))