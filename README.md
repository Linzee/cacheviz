# CacheViz

Vizualization of geocache caches in Brno region.

### Geocaching

Geocaching is a real-world, outdoor treasure hunting game using GPS-enabled devices. Participants navigate to a specific set of GPS coordinates and then attempt to find the geocache (container) hidden at that location.

## Inspiration

## Data

### Description

### Source

https://github.com/tomasbedrich/pycaching

### Preprocessing

- Calculate display coordinates (mx, my) from latitude and longitude.
- Aggregate count of cache logs by their cache id, type, and year-month to reduce amount of data (34MB -> 2.8MB). Raw data could also be used but processing them on the fly was too slow so I precalculated the values.

None: Only caches which are currently active are enclosed in the data. Canceled caches are not in the data.

## Used libraries

### Pycaching

https://github.com/tomasbedrich/pycaching

Previously mentioned in section `Data > Source`. Used to gather caches and their logs from selected area.

### Vega

https://vega.github.io/

Vega is visualization grammar, a declarative language for creating, saving, and sharing interactive visualization designs. With Vega, you can describe the visual appearance and interactive behavior of a visualization in a JSON format, and generate web-based views using Canvas or SVG.

My visualization consists of three different Vega-lite (high-level specification compiled into Vega language) plots - map, timeline and filters. Vega-lite language can be greatly utilized to quickly build visualization of data. But does not support complex interactions. Therefore I choose to implement data filtering and aggregation in JavaScript using following library.

### Data-Forge

https://github.com/data-forge/data-forge-ts/

Data-Forge is data transformation and analysis toolkit. I used it for data filtering, aggregation and joining sources (caches and logs).

## Problems

- I had to repair bug in library pycaching used for collection of data. One type of logs was missing. [submitted merge request]
- Using fields named "x" or "y" breaks Vega's interval selection! There goes hours of trying to find what is wrong :D

## Critical assessment and future work
