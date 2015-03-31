window.formatWords = function formatWords(value) {
  if (value < 10000) {
    return value;
  }
  if (value < 1000000) {
    return parseFloat((value / 1000).toFixed(1)) + 'k';
  }
  return parseFloat((value / 1000000).toFixed(2)) + 'm';
};

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

window.perPeriod = function ($, Highcharts, metric) {
  var options = {
    chart: {
      renderTo: 'perperiod',
      type: 'column'
    },
    title: {
      text: 'Performance per period of day'
    },
    xAxis: [
      {
        type: 'category',
        labels: {
          formatter: function () {
            return this.value.split('!')[0];
          }
        }
      }
    ],
    tooltip: {
      shared: true,
      formatter: function () {
        var period = this.x.split('!')[0],
            start = this.x.split('!')[1],
            end = this.x.split('!')[2],
            template = '<span style="font-size: 10px">' + period + ' (' + start + '\u2013' + end + ')</span>';

        $.each(this.points, function () {
          template += '<br/><span style="color:' + this.series.color + ';">\u25CF</span> ' + this.series.name + ': <b>' +
          (this.series.name === 'Wordcount' ? (window.formatWords(this.y) + ' words') : (this.y.toFixed(2) + ' wpm')) +
          '</b>';
        });

        return template;
      }
    },
    yAxis: [
      {
        title: {
          text: 'Words per minute'
        }
      },
      {
        title: {
          text: 'Word count'
        },
        opposite: true
      }
    ]
  }, meta = {
    performance: {
      name: 'Whole session',
      visible: metric === 'total'
    },
    realPerformance: {
      name: 'Exclude paused time',
      visible: metric === 'real'
    },
    totalWordcount: {
      name: 'Wordcount',
      type: 'line',
      yAxis: 1
    }
  },
    link = '/perperiod.json',
    chart;

  return $.getJSON(link, function (data) {
    options.xAxis[0].categories = data.period;
    options.series = window.joinMeta(data, meta);
    chart = new Highcharts.Chart(options);
    return chart;
  });
};
