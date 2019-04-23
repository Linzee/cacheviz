import pycaching
import numpy as np
import pandas as pd
import os

geocaching = pycaching.login()

point = geocaching.geocode("Brno")

caches = []

for c in geocaching.search(point, limit=32000):
    if not c.pm_only:
        cache = [c.wp, c.name, c.location, str(c.type), c.state, c.size, c.difficulty, c.terrain, c.favorites, c.hidden, c.author, c.attributes]
        print(len(caches), cache)
        caches.append(cache)

        if not os.path.exists("logs/"+c.wp+".csv"):
            logs = []

            for l in c.load_logbook():
                log = [l.visited, l.type, l.author]
                logs.append(log)

            df = pd.DataFrame(np.array(logs), columns = ["date", "type", "author"])
            df.to_csv("logs/"+c.wp+".csv")

        df = pd.DataFrame(np.array(caches), columns = ["wp", "name", "location", "type", "state", "size", "difficulty", "terrain", "favorites", "hidden", "author", "attributes"])
        df.to_csv("extracted_caches.csv")
