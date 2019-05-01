
var data_caches;
var data_logs;

var filter_type = [];
var filter_size = [];
var filter_difficulty = [];
var filter_terrain = [];
var filter_caches = [];
var filter_date_range = null;

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
    logs = logs.where(row => filter_date_range[0] <= row.date && row.date < filter_date_range[1])
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

  caches_arr = caches.toArray();

  updateDataView(view_map, 'source_0', caches_arr);
}

var updateDataFilter = function() {
  var caches = data_caches;

  if(filter_caches.length) {
    caches = caches.where(row => filter_caches.includes(row.wp))
  }

  caches_arr = caches.toArray();

  updateDataView(view_filters, 'source_0', caches_arr);
}

var updateDataTimeline = function() {
  var logs = data_logs;

  logs = logs.where(row => row.type == 'found_it');

  if(filter_caches.length) {
    logs = logs.where(row => filter_caches.includes(row.wp))
  }

  logs_timeline = logs.groupBy(row => row.date).select(group => {
    return {
      date: group.first().date,
      value: group.deflate(row => row.count).sum(),
    };
  }).inflate();

  logs_timeline_arr = logs_timeline.toArray();

  updateDataView(view_timeline, 'source_0', logs_timeline_arr);
}

var logDateGroup = function(date) {
  return date.getFullYear()+"-"+(date.getMonth()+1)
}

init = Promise.all([
  new Promise((resolve, reject) => {
    vegaEmbed("#map", "spec/map.vl.json", {
      renderer: "svg",
      actions: false,
      patch: (spec) => {
        spec.signals.forEach(s => {
          if(s.name == 'cache_tuple') {
            s.on.forEach(o => {
              if(o.events[0].type == 'click') {
                o.update = o.update.replace("? {unit", "? {datum: datum, unit")
              }
            })
          }
        })
        return spec
      }
    }).then(function(result) {
      view_map = result.view;

      view_map.addDataListener("cache_store", (name, e) => {
        filter_caches = [];
        e.forEach(ei => {
          filter_caches.push(ei.datum.wp);
        });
        updateDataFilter();
        updateDataTimeline();
      });

      resolve();
    }).catch(reject);
  }),
  new Promise((resolve, reject) => {
    vegaEmbed("#timeline", "spec/timeline.vl.json", {
      renderer: "svg",
      actions: false
    }).then(function(result) {
      view_timeline = result.view;

      view_timeline.addDataListener("range_store", (name, e) => {
        if(e.length) {
          filter_date_range = e[0].values[0];
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
      actions: false,
      patch: (spec) => {
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
.then(() => {
  return Promise.all([
    d3.csv("caches.csv").then((raw) => {
      return new Promise((resolve, reject) => {
        data_caches = new dataForge.DataFrame(raw)
          .transformSeries({
            x: x => parseFloat(x),
            y: y => parseFloat(y),
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
  updateDataFilter();
  updateDataTimeline();
  d3.select("#loading").style("display", "none");
})
.catch(console.error)
