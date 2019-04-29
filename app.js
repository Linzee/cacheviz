var view;

vegaEmbed('#view', 'visualization.vl.json').then(function(result) {
  view = result.view;

  view.addEventListener("click", (e) => {
    console.log(e)
  })
//addDataListener
}).catch(console.error);
