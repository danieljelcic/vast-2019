import numpy as np

data = np.genfromtxt('data.csv', delimiter='","', skip_header=1, dtype='str', encoding='utf-8', comments=None)
data_text = data[:,3]