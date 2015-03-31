window.formatWords = function formatWords(value) {
  if (value < 10000) {
    return value;
  }
  if (value < 1000000) {
    return parseFloat((value / 1000).toFixed(1)) + 'k';
  }
  return parseFloat((value / 1000000).toFixed(2)) + 'm';
};

window.formats = {
  word: '<span style="color: {series.color};">\u25CF</span> {series.name}: <b>{point.y:,.0f} words</b><br/>',
  perf: '<span style="color: {series.color};">\u25CF</span> {series.name}: <b>{point.y:,.2f} wpm</b><br/>'
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
      crosshairs: [false, true],
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

window.perSession = function ($, Highcharts, metric) {
  var options = {
      chart: {
        renderTo: 'persession',
        type: 'column'
      },
      title: {
        text: 'Performance per session duration'
      },
      tooltip: {
        shared: true,
        pointFormat: window.formats.perf,
        headerFormat: '<span style="font-size: 10px">~{point.key}min</span><br/>'
      },
      xAxis: [
        {
          type: 'category',
          labels: {
            format: '~{value}min'
          }
        }
      ],
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
      countdownWordcount: {
        name: 'Countdown wordcount',
        yAxis: 1,
        type: 'line',
        tooltip: {
          pointFormat: window.formats.word
        },
        zIndex: 6
      },
      forwardWordcount: {
        name: 'Forward wordcount',
        yAxis: 1,
        type: 'line',
        tooltip: {
          pointFormat: window.formats.word
        },
        zIndex: 5
      },
      countdownPerformance: {
        name: 'Countdown perf. (whole session)',
        visible: metric === 'total',
        zIndex: 4
      },
      countdownRealPerformance: {
        name: 'Countdown perf. (exclude paused)',
        visible: metric === 'real',
        zIndex: 3
      },
      forwardPerformance: {
        name: 'Forward perf. (whole session)',
        visible: metric === 'total',
        zIndex: 2
      },
      forwardRealPerformance: {
        name: 'Forward perf. (exclude paused)',
        visible: metric === 'real',
        zIndex: 1
      }
    },
    link = '/persession.json',
    chart;

  return $.getJSON(link, function (data) {
    options.xAxis[0].categories = data.duration;
    options.series = window.joinMeta(data, meta);
    chart = new Highcharts.Chart(options);
    return chart;
  });
};
