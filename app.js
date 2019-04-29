class Data {
  constructor(context) {
    this.context = context;
    this.onInitialized = null;

    var loadDataCaches = new Promise((resolve, reject) => {
      d3.csv("caches.csv").then((data) => {
        var data = new dataForge.DataFrame(data)
            .transformSeries({
              x: (x) => {return 0+x},
              y: (y) => {return 0+y},
              attributes: (attributes) => {return JSON.parse(attributes)}
            })
        return resolve(data)
      });
    });

    var loadDataLogs = new Promise((resolve, reject) => {
      d3.csv("caches_logs.csv").then((data) => {
        var data = new dataForge.DataFrame(data)
            .transformSeries({
              date: (date) => {return Date.parse(date)}
            })
        return resolve(data)
      });
    });

    loadDataCaches.then((data) => {
      this.caches = data;

      loadDataCaches.then((data) => {
        this.logs = data;
        if(this.onInitialized) {
          this.onInitialized();
        }
      })
    })
  }

  getCaches() {

  }
}

class Map {
  constructor(data) {
    this.data = data;
    this.map = d3.select("#map");
    setTimeout(() => {
      this.mapWidth = this.map.node().getBoundingClientRect().width;
      this.map.attr("width", this.mapWidth).attr("height", this.mapWidth);
    })
  }

  draw() {
    this.data.getCaches()
  }
}

// class Viz {
//   constructor() {
//     this.view = d3.select("#view")
//     this.map = d3.select("#map")
//     this.timeline = d3.select("#timeline")
//     this.hist_type = d3.select("#hist_type")
//     this.hist_size = d3.select("#hist_size")
//     this.hist_difficulty = d3.select("#hist_difficulty")
//     this.hist_terrain = d3.select("#hist_terrain")
//   }
// }

class Context {
  constructor() {
    this.data = new Data(this)
    this.map = new Map(this.data)

    this.filterCaches = null;
    this.filterType = null;
    this.filterSize = null;
    this.filterTerrain = null;
    this.filterDifficulty = null;
    this.filterTime = null;

    this.data.onInitialized = function() {
      this.map.draw()
    }
  }
}

app = new Context();
