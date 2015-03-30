window.startFromDate = function (date) {
  var pieces = date.split('-').map(function (i) {
    return parseInt(i, 10);
  }), result;
  pieces[1] -= 1;
  result = Date.UTC.apply(null, pieces);
  return result;
};

window.buildMeta = function (data, isAcc, showRem, showAdj, unit) {
  var start = window.startFromDate(data.date[0]),
      series = [],
      meta = {
        wordcount: {
          name: 'Word count',
          color: '#674732',
          visible: !!isAcc,
          yAxis: 0
        },
        charcount: {
          name: 'Character count',
          color: unit ? '#674732' : '#1F77B4',
          visible: !!isAcc,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          }
        },
        worddaily: {
          name: 'Daily writing',
          color: '#FF9E49',
          visible: !isAcc,
          yAxis: 0
        },
        chardaily: {
          name: 'Daily characters',
          color:  unit ? '#FF9E49' : '#2CA02C',
          visible: !isAcc,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          }
        },
        wordtarget: {
          name: 'Target',
          type: 'line',
          color: '#9e9e9e',
          visible: !!isAcc,
          yAxis: 0
        },
        chartarget: {
          name: 'Target',
          type: 'line',
          color: '#9e9e9e',
          visible: !!isAcc,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          }
        },
        worddailytarget: {
          name: 'Daily target',
          type: 'line',
          color: '#2ca02c',
          visible: !isAcc,
          yAxis: 0
        },
        chardailytarget: {
          name: 'Daily target',
          type: 'line',
          color: '#2ca02c',
          visible: !isAcc,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          }
        },
        wordadjusteddailytarget: {
          name: 'Adjusted daily target',
          type: 'line',
          color: '#9467bd',
          visible: showAdj,
          yAxis: 0
        },
        charadjusteddailytarget: {
          name: 'Adjusted daily target',
          type: 'line',
          color: '#9467bd',
          visible: showAdj,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          }
        },
        wordremaining: {
          name: 'Remaining word count',
          type: 'line',
          color: '#D62728',
          visible: showRem,
          yAxis: 0
        },
        charremaining: {
          name: 'Remaining character count',
          type: 'line',
          color: '#D62728',
          visible: showRem,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          }
        }
      };

  for (var key in data) {
    var serie = {
      data: data[key],
      id: key,
      pointInterval: 24 * 3600000,
      pointStart: start
    };

    if (meta[key]) {
      for (var info in meta[key]) {
        serie[info] = meta[key][info];
      }
      series.push(serie);
    }
  }
  return series;
};

window.chart2 = function chart2(link, $, Highcharts, chartType, showRem, showAdjusted, unit, title) {
  link = link + '?zoneOffset=' + (new Date()).getTimezoneOffset();

  var options = {
    chart: {
      renderTo: 'chart',
      type: 'column'
    },
    title: {
      text: title,
      useHTML: true
    },
    plotOptions: {
      column: {
        borderWidth: 0
      }
    },
    tooltip: {
      crosshairs: [true, true],
      shared: true,
      valueSuffix: ' words'
    },
    xAxis: {
      type: 'datetime',
      startOnTick: false,
      endOnTick: false
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
  },
      chart,
      isAcc = chartType === 'cumulative';

  $.getJSON(link, function (data) {
    options.series = window.buildMeta(data, isAcc, showRem, showAdjusted, unit);
    chart = new Highcharts.Chart(options);
  });

  $('#target-change')
      .data('acc', isAcc)
      .html(isAcc ? 'Show as daily writing' : 'Show as cumulative count')
      .click(function () {
        var self = $(this),
            ifAcc = ['wordcount', 'charcount', 'wordtarget', 'chartarget'],
            noAcc = ['worddaily', 'chardaily', 'worddailytarget', 'chardailytarget'];

        function doSeries(id, func) {
          var ser = chart.get(id);
          if (ser) {
            ser[func]();
          }
        }

        function hide (id) {
          doSeries(id, 'hide');
        }

        function show(id) {
          doSeries(id, 'show');
        }

        if (self.data('acc')) {
          self.html('Show as cumulative count');
          ifAcc.forEach(hide);
          noAcc.forEach(show);
          self.data('acc', false);
        } else {
          self.html('Show as daily writing');
          noAcc.forEach(hide);
          ifAcc.forEach(show);
          self.data('acc', true);
        }
      });
};

window.targetChart = function (targetId, $, Highcharts, chartType, showRem, showAdjusted, unit, title) {
  window.chart2('/targets/' + targetId + '/data.json', $, Highcharts, chartType, showRem, showAdjusted, unit, title);
};
