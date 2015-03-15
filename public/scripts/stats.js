/* jshint unused:false */
function setupYearly(CalHeatMap, yearData, legend) {
  var cal = new CalHeatMap(),
      today = new Date(),
      start = new Date();

  start.setFullYear(start.getFullYear() - 1, start.getMonth() + 1);

  cal.init({
    itemSelector: "#heatmap",
    data: yearData,
    dataType: 'json',
    domain: 'month',
    subDomain: 'day',
    domainGutter: 5,
    rowLimit: 7,
    start: start,
    legend: legend,
    itemName: ["word", "words"],
    subDomainTitleFormat: {
      empty: 'No word written on {date}',
      filled: '{count} {name} written {connector} {date}'
    },
    tooltip: true,
    highlight: today,
    domainLabelFormat: '%b-%y',
    cellSize: 11
  });
}

function setupPerPeriod(c3, metric) {
  var chart = c3.generate({
    bindto: '#perperiod',
    data: {
      url: '/perperiod.json',
      mimeType: 'json',
      x: 'period',
      types: {
        performance: 'bar',
        realPerformance: 'bar',
        totalWordcount: 'line'
      },
      hide: [metric === 'real' ? 'performance' : 'realPerformance'],
      names: {
        performance: 'Whole session',
        realPerformance: 'Exclude paused time',
        totalWordcount: 'Wordcount'
      },
      axes: {
        performance: 'y',
        realPerformance: 'y',
        totalWordcount: 'y2'
      },
      colors: {
        realPerformance: '#9467BD'
      }
    },
    axis: {
      x: {
        type: 'category',
        tick: {
          format: function (x) {
            return chart.categories()[x].split('!')[0];
          }
        }
      },
      y: {
        label: 'Words per minute',
        min: 0,
        padding: {
          bottom: 0
        },
      },
      y2: {
        show: true,
        label: 'Words',
        min: 0,
        padding: {
          bottom: 0
        },
      }
    },
    tooltip: {
      format: {
        title: function (x) {
          var pieces = chart.categories()[x].split('!');
          return pieces[0] + ' (' + pieces[1] + '—' + pieces[2] + ')';
        },
        value: function (value, ratio, id) {
          if (id === 'totalWordcount') {
            return value + ' words';
          }
          return value.toFixed(2) + ' wpm';
        }
      }
    }
  });
}
