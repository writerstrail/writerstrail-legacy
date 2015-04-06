/* globals exports, window */

var WTChart;

if (typeof window === 'undefined' && typeof exports !== 'undefined') {
  WTChart = exports;
} else {
  WTChart = window;
}

WTChart.startFromDate = function (date) {
  var pieces = date.split('-').map(function (i) {
    return parseInt(i, 10);
  }), result;
  pieces[1] -= 1;
  result = Date.UTC.apply(null, pieces);
  return result;
};

WTChart.joinMeta = function (data, meta) {
  var series = [];
  for (var key in data) {
    if (!data.hasOwnProperty(key)) {
      continue;
    }
    var serie = {
      data: data[key],
      id: key
    };

    if (meta[key]) {
      for (var info in meta[key]) {
        if (meta[key].hasOwnProperty(info)) {
          serie[info] = meta[key][info];
        }
      }
      series.push(serie);
    }
  }
  return series;
};

WTChart.buildMeta = function (data, isAcc, showRem, showAdj, unit, isExport) {
  var start = WTChart.startFromDate(data.date[0]),
      showLegend = !isExport,
      meta = {
        wordcount: {
          name: 'Word count',
          color: '#674732',
          visible: !!isAcc,
          showInLegend: isAcc || showLegend,
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        charcount: {
          name: 'Character count',
          color: unit ? '#674732' : '#1F77B4',
          visible: !!isAcc,
          showInLegend: isAcc || showLegend,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          },
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        worddaily: {
          name: 'Daily writing',
          color: '#FF9E49',
          visible: !isAcc,
          showInLegend: !isAcc || showLegend,
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        chardaily: {
          name: 'Daily characters',
          color:  unit ? '#FF9E49' : '#2CA02C',
          visible: !isAcc,
          showInLegend: !isAcc || showLegend,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          },
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        wordtarget: {
          name: 'Target',
          type: 'line',
          color: '#9e9e9e',
          visible: !!isAcc,
          showInLegend: isAcc || showLegend,
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        chartarget: {
          name: 'Target',
          type: 'line',
          color: '#9e9e9e',
          visible: !!isAcc,
          showInLegend: isAcc || showLegend,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          },
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        worddailytarget: {
          name: 'Daily target',
          type: 'line',
          color: '#2ca02c',
          visible: !isAcc,
          showInLegend: !isAcc || showLegend,
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        chardailytarget: {
          name: 'Daily target',
          type: 'line',
          color: '#2ca02c',
          visible: !isAcc,
          showInLegend: !isAcc || showLegend,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          },
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        wordadjusteddailytarget: {
          name: 'Adjusted daily target',
          type: 'line',
          color: '#9467bd',
          visible: showAdj,
          showInLegend: showAdj || showLegend,
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        charadjusteddailytarget: {
          name: 'Adjusted daily target',
          type: 'line',
          color: '#9467bd',
          visible: showAdj,
          showInLegend: showAdj || showLegend,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          },
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        wordremaining: {
          name: 'Remaining word count',
          type: 'line',
          color: '#D62728',
          visible: showRem,
          showInLegend: showRem || showLegend,
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        charremaining: {
          name: 'Remaining character count',
          type: 'line',
          color: '#D62728',
          visible: showRem,
          showInLegend: showRem || showLegend,
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          },
          pointStart: start,
          pointInterval: 24 * 3600000
        }
      };
  return WTChart.joinMeta(data, meta);
};

WTChart.chartOptions = function chart(series, chartType, showRem, showAdjusted, unit, title) {
  var now = new Date(),
    today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return {
    chart: {
      renderTo: 'chart',
      type: 'column',
      alignTicks: false
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
    credits: {
      text: 'Writer\'s Trail',
      href: 'http://writerstrail.georgemarques.com.br'
    },
    xAxis: {
      type: 'datetime',
      startOnTick: false,
      endOnTick: false,
      plotLines: [
        {
          color: '#AAAAAA',
          width: 1,
          value: +today,
          id: 'today',
          label: {
            text: 'Today',
            style: {
              color: '#AAAAAA'
            },
            rotation: 90
          }
        }
      ]
    },
    yAxis: [
      {
        title: {
          text: 'Word count'
        },
        floor: 0,
        min: 0
      },
      {
        title: {
          text: 'Character count'
        },
        opposite: true,
        gridLineWidth: 0,
        floor: 0,
        min: 0
      }
    ],
    series: series
  };
};

WTChart.bindButton = function ($, chartType) {
  var isAcc = chartType === 'cumulative';

  $('#target-change')
    .data('acc', isAcc)
    .html(isAcc ? 'Show as daily writing' : 'Show as cumulative count')
    .click(function () {
      var self = $(this),
        ifAcc = ['wordcount', 'charcount', 'wordtarget', 'chartarget'],
        noAcc = ['worddaily', 'chardaily', 'worddailytarget', 'chardailytarget'];

      function doSeries(id, func) {
        var ser = $('#chart').highcharts().get(id);
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

WTChart.linkChart = function (link, $, Highcharts, chartType, showRem, showAdjusted, unit, title) {
  var isAcc = chartType === 'cumulative';
  link = link + '?zoneOffset=' + (new Date()).getTimezoneOffset();
  $.getJSON(link, function (data) {
    var series = WTChart.buildMeta(data, isAcc, showRem, showAdjusted, unit);
    WTChart.chart(series, $, Highcharts, chartType, showRem, showAdjusted, unit, title);
  });
};

WTChart.targetChart = function (targetId, $, Highcharts, chartType, showRem, showAdjusted, unit, title) {
  WTChart.linkChart('/targets/' + targetId + '/data.json', $, Highcharts, chartType, showRem, showAdjusted, unit, title);
};

WTChart.chart = function (series, $, Highcharts, chartType, showRem, showAdjusted, unit, title) {
  var options = WTChart.chartOptions(series, chartType, showRem, showAdjusted, unit, title);
  new Highcharts.Chart(options, function () {
    WTChart.bindButton($, chartType);
  });
};
