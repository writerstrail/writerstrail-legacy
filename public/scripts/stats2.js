window.yearly = function (Highcharts, yearData) {
  var options = {
    chart: {
      renderTo: 'heatmap',
      type: 'heatmap',
      zoomType: 'xy',
      panning: true,
      panKey: 'shift',
      height: 300
    },
    exporting: {
      buttons: {
        contextButton: {
          verticalAlign: 'bottom',
          y: -20
        }
      }
    },
    title: false,
    colorAxis: {
      min: 0,
      stops: [
        [0.1, '#DAE289'],
        [0.9, '#3B6427']
      ]
    },
    tooltip: {
      crosshairs: [false, false]
    },
    plotOptions: {
      heatmap: {
        borderColor: '#FFF'
      }
    },
    xAxis: {
      type: 'datetime',
      min: yearData[0].x,
      max: yearData[yearData.length - 1].x
    },
    yAxis: {
      title: null,
      categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      tickWidth: 1
    },
    series: [
      {
        name: 'Word count',
        borderWidth: 2,
        colsize: 7 * 24 * 36e5, // one week
        pointInterval: 7 * 24 * 36e5, // one week
        data: yearData,
        tooltip: {
          pointFormat: '{point.x:%A, %B %e, %Y}: <b>{point.value} words</b>'
        }
      }
    ]
  };

  return new Highcharts.Chart(options);
};
