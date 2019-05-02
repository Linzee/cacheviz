import numpy as np
import pandas as pd
from geopy.point import Point
import glob
import datetime

# CACHES

df = pd.read_csv("extracted_caches.csv", index_col=0)

fla = 49.1000
flo = 16.4500
tla = 49.3000
tlo = 16.7600

sla = tla - fla # 0.2
slo = tlo - flo # 0.31

df['my'] = df['location'].apply(lambda l: (Point(l).latitude - fla) / sla)
df['mx'] = df['location'].apply(lambda l: (Point(l).longitude - flo) / slo)

df['type'] = df['type'].apply(lambda s: s[len('Type.'):])
df['size'] = df['size'].apply(lambda s: s[len('Size.'):])

df.to_csv("../caches.csv", index=False)

# LOGS

# logs = pd.DataFrame()
#
# for path in glob.glob("logs/*.csv"):
#     df = pd.read_csv(path, index_col=0)
#     df['type'] = df['type'].apply(lambda s: s[len('Type.'):])
#     df['wp'] = path[len("logs/"):-len(".csv")]
#     logs = logs.append(df, ignore_index=True)
#
# logs.to_csv("extracted_logs.csv", index=False)
#
# logs['date'] = logs['date'].apply(lambda d: str(datetime.datetime.strptime(d, "%Y-%m-%d").year)+"-"+str(datetime.datetime.strptime(d, "%Y-%m-%d").month)+"-01")
#
# logsGrouped = logs.groupby(['wp', 'date', 'type'])['wp'].count().rename(columns={'wp': 'count'}).reset_index().rename(columns={0: 'count'})
#
# logsGrouped.to_csv("../caches_logs.csv", index=False)
