import numpy as np
import pandas as pd
from geopy.point import Point

df = pd.read_csv("extracted_caches.csv", index_col=0)

fla = 49.1000
flo = 16.4500
tla = 49.3000
tlo = 16.7600

sla = tla - fla # 0.2
slo = tlo - flo # 0.31

df['x'] = df['location'].apply(lambda l: (Point(l).latitude - fla) / sla)
df['y'] = df['location'].apply(lambda l: (Point(l).longitude - flo) / slo)

df['type'] = df['type'].apply(lambda s: s[len('Type.'):])
df['size'] = df['size'].apply(lambda s: s[len('Size.'):])

df.to_csv("../caches.csv")
