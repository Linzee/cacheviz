var data_caches;
var data_logs;

var filter_type = [];
var filter_size = [];
var filter_difficulty = [];
var filter_terrain = [];

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

var updateData = function() {
  console.log("update data");

  var caches = data_caches;
  if(filter_type.length) {
    caches = caches.where(row => filter_type.includes(row["type"]))
  }
  if(filter_size.length) {
    caches = caches.where(row => filter_size.includes(row["size"]))
  }
  if(filter_difficulty.length) {
    caches = caches.where(row => filter_difficulty.includes(row["difficulty"]))
  }
  if(filter_terrain.length) {
    caches = caches.where(row => filter_terrain.includes(row["terrain"]))
  }

  caches_arr = caches.toArray();

  updateDataView(view_map, 'source_0', caches_arr);
  updateDataView(view_filters, 'source_0', caches_arr);
}

init = Promise.all([
  new Promise((resolve, reject) => {
    vegaEmbed("#map", "spec/map.vl.json", {
      renderer: "svg",
      actions: false
    }).then(function(result) {
      view_map = result.view;

      view_map.addDataListener("cache_store", (e, a) => {
        console.log(e, a)
      })

      resolve();
    }).catch(reject);
  }),
  new Promise((resolve, reject) => {
    vegaEmbed("#timeline", "spec/timeline.vl.json", {
      renderer: "svg",
      actions: false
    }).then(function(result) {
      view_timeline = result.view;

      // view_timeline.addDataListener("range_store", (e) => {
      //   console.log(e)
      // })

      resolve()
    }).catch(reject);
  }),
  new Promise((resolve, reject) => {
    vegaEmbed("#filters", "spec/filters.vg.json", {
      renderer: "svg",
      actions: false
    }).then(function(result) {
      view_filters = result.view;

      view_filters.addDataListener("type_store", (name, e) => {
        filter_type = [];
        e.forEach(ei => {
          filter_type.push(ei.datum.type);
        });
        updateData();
      });
      view_filters.addDataListener("size_store", (name, e) => {
        filter_size = [];
        e.forEach(ei => {
          filter_size.push(ei.datum.size);
        });
        updateData();
      });
      view_filters.addDataListener("difficulty_store", (name, e) => {
        filter_difficulty = [];
        e.forEach(ei => {
          filter_difficulty.push(ei.datum.difficulty);
        });
        updateData();
      });
      view_filters.addDataListener("terrain_store", (name, e) => {
        filter_terrain = [];
        e.forEach(ei => {
          filter_terrain.push(ei.datum.terrain);
        });
        updateData();
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
          })
        return resolve();
      });
    })
  ])
})
.then(updateData)
.catch(console.error)
