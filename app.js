var data_caches;
var data_logs;

var view_map;
var view_timeline;
var view_hist_type;
var view_hist_size;
var view_hist_difficulty;
var view_hist_terrain;

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
    vegaEmbed("#hist_type", "spec/hist_type.vl.json", {
      renderer: "svg",
      actions: false
    }).then(function(result) {
      view_hist_type = result.view;

      resolve()
    }).catch(reject);
  }),
  new Promise((resolve, reject) => {
    vegaEmbed("#hist_size", "spec/hist_size.vl.json", {
      renderer: "svg",
      actions: false
    }).then(function(result) {
      view_hist_size = result.view;

      resolve()
    }).catch(reject);
  }),
  new Promise((resolve, reject) => {
    vegaEmbed("#hist_difficulty", "spec/hist_difficulty.vl.json", {
      renderer: "svg",
      actions: false
    }).then(function(result) {
      view_hist_difficulty = result.view;

      resolve()
    }).catch(reject);
  }),
  new Promise((resolve, reject) => {
    vegaEmbed("#hist_terrain", "spec/hist_terrain.vl.json", {
      renderer: "svg",
      actions: false
    }).then(function(result) {
      view_hist_terrain = result.view;

      resolve()
    }).catch(reject);
  })
]).then(() => {
  new Promise((resolve, reject) => {
    d3.csv("caches.csv").then((raw) => {
      var data = new dataForge.DataFrame(raw)
        .transformSeries({
          x: x => parseFloat(x),
          y: y => parseFloat(y),
          // attributes: a => JSON.parse(a)
        })
      return resolve(data.toArray());
    });
  }).then((data) => {
    data_caches = data;
    view_map.insert("source_0", data_caches)
    view_hist_type.insert("source_0", data_caches)
    view_hist_size.insert("source_0", data_caches)
    view_hist_difficulty.insert("source_0", data_caches)
    view_hist_terrain.insert("source_0", data_caches)
    view_map.runAsync()
    view_hist_type.runAsync()
    view_hist_size.runAsync()
    view_hist_difficulty.runAsync()
    view_hist_terrain.runAsync()
  })
})
.catch(console.error)
