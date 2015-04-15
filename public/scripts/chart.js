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

WTChart.joinMeta = function (data, meta, showLegend) {
  var series = [];
  for (var key in data) {
    if (!data.hasOwnProperty(key)) {
      continue;
    }
    var serie = {
      data: data[key],
      id: key,
      visible: data.visibility[key],
      showInLegend: data.visibility[key] || showLegend
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

WTChart.buildMeta = function (data, unit, isExport) {
  var start = WTChart.startFromDate(data.date[0]),
      showLegend = !isExport,
      meta = {
        wordcount: {
          name: 'Word count',
          color: '#674732',
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        charcount: {
          name: 'Character count',
          color: unit ? '#674732' : '#1F77B4',
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
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        chardaily: {
          name: 'Daily characters',
          color:  unit ? '#FF9E49' : '#2CA02C',
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
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        chartarget: {
          name: 'Target',
          type: 'line',
          color: '#9e9e9e',
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
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        chardailytarget: {
          name: 'Daily target',
          type: 'line',
          color: '#2ca02c',
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
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        charadjusteddailytarget: {
          name: 'Adjusted daily target',
          type: 'line',
          color: '#9467bd',
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
          yAxis: 0,
          pointStart: start,
          pointInterval: 24 * 3600000
        },
        charremaining: {
          name: 'Remaining character count',
          type: 'line',
          color: '#D62728',
          yAxis: 1,
          tooltip: {
            valueSuffix: ' characters'
          },
          pointStart: start,
          pointInterval: 24 * 3600000
        }
      };
  return WTChart.joinMeta(data, meta, showLegend);
};

WTChart.chartOptions = function chart(series, unit, title, today) {
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
        gridLineWidth: unit === 'char' ? 0 : 1,
        floor: 0,
        min: 0
      },
      {
        title: {
          text: 'Character count'
        },
        opposite: true,
        gridLineWidth: unit === 'char' ? 1 : 0,
        floor: 0,
        min: 0
      }
    ],
    series: series
  };
};

WTChart.bindButton = function ($) {
  var isAcc = true;

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

WTChart.linkChart = function (link, $, Highcharts, unit, title, zoneOffset) {
  link = link + '?zoneOffset=' + (-zoneOffset);
  $.getJSON(link, function (data) {
    var series = WTChart.buildMeta(data, unit);
    WTChart.chart(link, series, $, Highcharts, unit, title, zoneOffset);
  });
};

WTChart.chart = function (link, series, $, Highcharts, unit, title, zoneOffset) {
  var now, today, options, userOffset, plotOptions, csrfvalue = window.csrfvalue || null;
  userOffset = (new Date()).getTimezoneOffset();
  now = new Date(+(new Date()) + (userOffset * 6e4) + (zoneOffset * 6e4));
  today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  options = WTChart.chartOptions(series, unit, title, today);

  function legendSave(event) {
    $.post(link, {
      item: event.target.userOptions.id,
      visibility: event.target.visible,
      _csrf: csrfvalue
    });
  }

  plotOptions = {
    events: {
      hide: legendSave,
      show: legendSave
    }
  };

  options.plotOptions.line = plotOptions;
  options.plotOptions.column.events = plotOptions.events;

  new Highcharts.Chart(options, function () {
    WTChart.bindButton($);
  });
};

WTChart.deleteImageSetup = function ($, link) {
  $('#deleteimages').click(function () {
    var $alert = $('<div class="alert alert-dismissable" role="alert">' +
    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
    '<span aria-hidden="true">&times;</span>' +
    '</button>' +
    '<span class="alert-content"></span>' +
    '</div>');
    $.getJSON(link)
      .done(function (data) {
        $alert.addClass('alert-success').children('.alert-content').html(data.msg);
        $('#alerts').append($alert);
      })
      .fail(function (response) {
        var data = response.responseJSON;
        $alert.addClass('alert-danger').children('.alert-content').html(data.error);
        $('#alerts').append($alert);
      });
  });
};

