window.chart2 = function chart2(link, $, highCharts, chartType, showRem, showAdjusted, unit) {
  link = link + '?zoneOffset=' + (new Date()).getTimezoneOffset();

  var options = {
    chart: {
      renderTo: 'chart',
      type: 'column'
    },
    plotOptions: {
      column: {
        borderWidth: 0
      }
    },
    xAxis: {
      type: 'datetime',
      minRange: 30 * 24 * 3600000
    },
    yAxis: [
      {
        title: {
          text: 'Word count'
        }
      },
      {
        title: {
          text: 'Character count'
        },
        opposite: true
      }
    ],
    series: []
  };

  $.getJSON(link, function (data) {
    var start = Date.UTC.apply(null, data.date[0].split('-').map(function (piece) {
      return parseInt(piece, 10);
    })),
        meta = {
          wordcount: {
            name: 'Word count',
            color: '#674732',
            visible: false,
            yAxis: 0
          },
          charcount: {
            name: 'Character count',
            visible: false,
            yAxis: 1
          },
          worddaily: {
            name: 'Daily writing',
            visible: true,
            yAxis: 0
          },
          chardaily: {
            name: 'Daily characters',
            visible: true,
            yAxis: 1
          }
        };

    for (var key in data) {
      var serie = {
        data: data[key],
        pointInterval: 24 * 3600000,
        pointStart: start
      };

      if (meta[key]) {
        for (var info in meta[key]) {
          serie[info] = meta[key][info];
        }
        options.series.push(serie);
      }
    }
    new Highcharts.Chart(options);
  });
};