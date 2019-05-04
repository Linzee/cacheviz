
var data_caches;
var data_logs;

var filter_type = [];
var filter_size = [];
var filter_difficulty = [];
var filter_terrain = [];
var filter_caches_range = null;
var filter_date_range = null;

var heatmap_size = 40;

var view_map;
var view_timeline;
var view_filters;

var updateDataView = function(view, name, data) {
  var current = view.data(name)
  var changeset = vega.changeset()

  data.forEach((t) => {
    if(!current.includes(t)) {
      changeset.insert(t);
    }
  });

  current.forEach((t) => {
    if(!data.includes(t)) {
      changeset.remove(t);
    }
  });

  view.change(name, changeset);
  view.runAsync();
}

var updateDataMap = function() {
  var caches = data_caches;
  var logs = data_logs;

  if(filter_type.length) {
    caches = caches.where(row => filter_type.includes(row.type))
  }
  if(filter_size.length) {
    caches = caches.where(row => filter_size.includes(row.size))
  }
  if(filter_difficulty.length) {
    caches = caches.where(row => filter_difficulty.includes(row.difficulty))
  }
  if(filter_terrain.length) {
    caches = caches.where(row => filter_terrain.includes(row.terrain))
  }

  logs = logs.where(row => row.type == 'found_it')

  if(filter_date_range != null) {
    logs = logs.where(row => filter_date_range.f <= row.date && row.date < filter_date_range.t)
  }

  logs_value = logs.groupBy(row => row.wp).select(group => {
    return {
      wp: group.first().wp,
      value: group.deflate(row => row.count).sum(),
    };
  }).inflate();

  caches = caches.join(
    logs_value,
    leftRow => leftRow.wp,
    rightRow => rightRow.wp,
    (leftRow, rightRow) => {
      return Object.assign({}, leftRow, rightRow);
    }
  );

  caches_arr = [];
  heatmap_arr = [];

  if(d3.select("#showCaches").property("checked")) {
    caches_arr = caches.toArray();
  }

  if(d3.select("#showHeatmap").property("checked")) {
    heatmap = caches.groupBy(row => Math.round(row.mx * heatmap_size)+"-"+Math.round(row.my * heatmap_size)).select(group => {
      var mx = Math.round(group.first().mx * heatmap_size) / heatmap_size;
      var my = Math.round(group.first().my * heatmap_size) / heatmap_size;
      return {
        mx: mx,
        my: my,
        mx2: mx + 1/heatmap_size,
        my2: my + 1/heatmap_size,
        caches: group.count(),
        value: group.deflate(row => row.value).sum(),
      };
    }).inflate();

    heatmap_arr = heatmap.toArray();
  }

  updateDataView(view_map, 'source_0', heatmap_arr);
  updateDataView(view_map, 'source_1', caches_arr);
}

var updateDataFilterAndTimeline = function() {
  var caches = data_caches;
  var logs = data_logs;

  if(filter_caches_range != null) {
    caches = caches.where(row => row.mx >= filter_caches_range.xf && row.mx < filter_caches_range.xt && row.my >= filter_caches_range.yf && row.my < filter_caches_range.yt);
  }

  logs = logs.where(row => row.type == 'found_it');

  logs = logs.join(
    caches,
    leftRow => leftRow.wp,
    rightRow => rightRow.wp,
    (leftRow, rightRow) => {
      return leftRow; // using join just to filter if caches are displayed, return only log
    }
  );

  logs_timeline = logs.groupBy(row => row.date).select(group => {
    return {
      date: group.first().date,
      value: group.deflate(row => row.count).sum(),
    };
  }).inflate();

  caches_arr = caches.toArray();
  logs_timeline_arr = logs_timeline.toArray();

  updateDataView(view_filters, 'source_0', caches_arr);
  updateDataView(view_timeline, 'source_0', logs_timeline_arr);
}

var logDateGroup = function(date) {
  return date.getFullYear()+"-"+(date.getMonth()+1)
}

init = fetch("app-style.json")
  .then(response => response.json())
  .then(styleConfig => {
    return Promise.all([
      new Promise((resolve, reject) => {
        vegaEmbed("#map", "spec/map.vl.json", {
          renderer: "svg",
          config: styleConfig,
          actions: false,
          loader: {
            'target': '_blank'
          },
          patch: (spec) => {

            spec.marks.forEach(m => {
              if(m.name == 'cache_brush' || m.name == 'cache_brush_bg') {
                m.interactive = false;
              }
            })

            spec.marks.unshift({
              "type": "image",
              "clip": true,
              "interactive": false,
              "encode": {
                "enter": {
                  "url": {"value": "images/brno.png"}
                },
                "update": {
                  "opacity": {"value": 0.3},
                  "x": {"scale": "map_x", "value": 0},
                  "y": {"scale": "map_y", "value": 1},
                  "width": {"signal": "scale(\"map_x\", 1) - scale(\"map_x\", 0)"},
                  "height": {"signal": "scale(\"map_y\", 0) - scale(\"map_y\", 1)"}
                }
              }
            });

            return spec;
          }
        }).then(function(result) {
          view_map = result.view;

          view_map.addDataListener("cache_store", (name, e) => {
            if(e.length) {
              filter_caches_range = {
                xf: e[0].values[0][0],
                xt: e[0].values[0][1],
                yf: e[0].values[1][1],
                yt: e[0].values[1][0]
              }
            } else {
              filter_caches_range = null;
            }
            updateDataFilterAndTimeline();
          });

          resolve();
        }).catch(reject);
      }),
      new Promise((resolve, reject) => {
        vegaEmbed("#timeline", "spec/timeline.vl.json", {
          renderer: "svg",
          config: styleConfig,
          actions: false,
        }).then(function(result) {
          view_timeline = result.view;

          view_timeline.addDataListener("range_store", (name, e) => {
            if(e.length) {
              filter_date_range = {
                f: e[0].values[0][0],
                t: e[0].values[0][1]
              }
            } else {
              filter_date_range = null;
            }
            updateDataMap();
          })

          resolve()
        }).catch(reject);
      }),
      new Promise((resolve, reject) => {
        vegaEmbed("#filters", "spec/filters.vl.json", {
          renderer: "svg",
          config: styleConfig,
          actions: false,
          patch: (spec) => {

            // Add whole datum into selection stored data, used to extract parameters like type, size, difficulty, terrain
            spec.marks.forEach(m => {
              m.signals.forEach(s => {
                if(s.name == 'type_tuple' || s.name == 'size_tuple' || s.name == 'difficulty_tuple' || s.name == 'terrain_tuple') {
                  s.on.forEach(o => {
                    if(o.events[0].type == 'click') {
                      o.update = o.update.replace("? {unit", "? {datum: datum, unit")
                    }
                  })
                }
              })
            })

            return spec
          }
        }).then(function(result) {
          view_filters = result.view;

          view_filters.addDataListener("type_store", (name, e) => {
            filter_type = [];
            e.forEach(ei => {
              filter_type.push(ei.datum.type);
            });
            updateDataMap();
          });
          view_filters.addDataListener("size_store", (name, e) => {
            filter_size = [];
            e.forEach(ei => {
              filter_size.push(ei.datum.size);
            });
            updateDataMap();
          });
          view_filters.addDataListener("difficulty_store", (name, e) => {
            filter_difficulty = [];
            e.forEach(ei => {
              filter_difficulty.push(ei.datum.difficulty);
            });
            updateDataMap();
          });
          view_filters.addDataListener("terrain_store", (name, e) => {
            filter_terrain = [];
            e.forEach(ei => {
              filter_terrain.push(ei.datum.terrain);
            });
            updateDataMap();
          });

          resolve()
        }).catch(reject);
      })
    ])
  })
.then(() => {
  return Promise.all([
    d3.csv("caches.csv").then((raw) => {
      return new Promise((resolve, reject) => {
        data_caches = new dataForge.DataFrame(raw)
          .transformSeries({
            mx: mx => parseFloat(mx),
            my: my => parseFloat(my),
            // attributes: a => JSON.parse(a)
          })
        return resolve();
      });
    }),
    d3.csv("caches_logs.csv").then((raw) => {
      return new Promise((resolve, reject) => {
        data_logs = new dataForge.DataFrame(raw)
          .transformSeries({
            date: d => Date.parse(d),
            count: c => parseInt(c)
          })
        return resolve();
      });
    })
  ])
})
.then(() => {
  updateDataMap();
  updateDataFilterAndTimeline();

  d3.select("#loading").style("display", "none");

  d3.select("#showCaches").on("change", updateDataMap);
  d3.select("#showHeatmap").on("change", updateDataMap);
})
.catch(console.error)
