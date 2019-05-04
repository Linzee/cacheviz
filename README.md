# CacheViz

Vizualization of geocache caches in Brno region.

![Screenshot of CacheViz application](images/screen.jpg)

### Geocaching

Geocaching is a real-world, outdoor treasure hunting game using GPS-enabled devices. Participants navigate to a specific set of GPS coordinates and then attempt to find the geocache (container) hidden at that location.

## Inspiration

I fancied idea of visualizing events with time-stamps concerning some local area. I tried to find such source ___ and I choose Geocaching ___ it is accesed quite easily. That's why I choose this data source.

## Data

### Description

Data are stored in files `caches.csv` and `caches_logs.csv`.

#### Caches `caches.csv`

- wp - ID of the cache
- name - name of the cache
- location - latitude and longitude of cahce
- type - one of traditional, multi-cache, mystery, unknown, letterbox hybrid, event, mega-event, giga-event, earthcache, cito, cache in trash out event, webcam, virtual, wherigo, lost and found event, project ape, groundspeak hq, gps adventures exhibit, groundspeak block party, locationless (reverse); only subset of them appears in Brno region (9 types)
- state - whether this cache is visible (always true)
- size - one of micro, small, regular, large, not_chosen, virtual, other
- difficulty - value between 1.0 and 5.0
- terrain - value between 1.0 and 5.0
- favorites - (currently not used)
- hidden - date when cache was created (currently not used)
- author - author of the cache (currently not used)
- attributes - JSON describing attributes of place (currently not used)
- mx and my - local position for displaying on map of Brno

#### Logs `caches_logs.csv`

- wp - ID of the cache
- date - date of first day of month for aggregated data
- type - type of log, one of enable_listing, found_it, didnt_find_it, note, needs_maintenance,...
- count - count of logs for given cache ID, month and log type

### Source

I gathered data myself using [pycaching](https://github.com/tomasbedrich/pycaching) library. There is few important notes to mention:

- None: Only caches which are currently active are enclosed in the data. Canceled caches are not in the data.
- None: Data are downloaded only up to 2019-04-20 (they can be updated by running appropriate scripts again).
- Note: Logs for events were not downloaded for some reason, therefore this caches are not displayed correctly.
- Note: 8km radius from center of Brno is gathered by default.

### Preprocessing

Preprocessing is done by custom python scripts using Pandas.

- Calculate display coordinates (mx, my) from latitude and longitude.
- Gathered data contain each individual log. I aggregate count of cache logs by their cache id, type, and year-month to reduce amount of data (34MB -> 2.8MB). Raw data could also be used but processing them on the fly was too slow so I precalculated the values.

## Used libraries

### Pycaching

https://github.com/tomasbedrich/pycaching

Previously mentioned in section `Data > Source`. Used to gather caches and their logs from Brno region.

### Vega

https://vega.github.io/

Vega is visualization grammar, a declarative language for creating, saving, and sharing interactive visualization designs. With Vega, you can describe the visual appearance and interactive behavior of a visualization in a JSON format, and generate web-based views using Canvas or SVG.

My visualization consists of three different Vega-lite (high-level specification compiled into Vega language) plots - map, timeline and filters. Vega-lite language can be greatly utilized to quickly build visualization of data. But it is not intended for complex interactions, therefore I choose to implement data filtering and aggregation in JavaScript using following library.

### Data-Forge

https://github.com/data-forge/data-forge-ts/

Data-Forge is data transformation and analysis toolkit. I used it for data filtering, aggregation and joining sources (caches and logs) when user interacts with visualization.

## Problems

- I had to repair bug in library pycaching used for collection of data. One type of logs was missing. (I submitted a merge request.)
- Using fields named "x" or "y" breaks Vega's interval selection! There goes hours of trying to find what is wrong :D

## Critical assessment and future work
