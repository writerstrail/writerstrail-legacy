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
        realPerformance: 'bar'
      },
      hide: [metric === 'real' ? 'performance' : 'realPerformance'],
      names: {
        performance: 'Total time',
        realPerformance: 'Exclude paused time'
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
      }
    },
    tooltip: {
      format: {
        title: function (x) {
          var pieces = chart.categories()[x].split('!');
          return pieces[0] + ' (' + pieces[1] + '—' + pieces[2] + ')';
        }
      }
    }
  });
}
