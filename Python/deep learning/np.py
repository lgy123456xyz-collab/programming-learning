import numpy as np
A=np.array([[1,2],[3,4],[5,6],[7,8],[9,10]])
A=A.flatten()
A[np.array([0,2,4])]
print(A[np.array([0,2,4])])
print(A[A>5])

