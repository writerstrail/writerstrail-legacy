/*jshint unused:false*/
function buildChart(targetId, $, c3, d3, chartType, showRem, showAdjusted) {
  linkChart('/targets/' + targetId + '/data.json', $, c3, d3, chartType, showRem, showAdjusted);
}

function linkChart(link, $, c3, d3, chartType, showRem, showAdjusted) {
  $(function () {
    var isAcc = chartType === 'cumulative',
      chart = c3.generate({
      bindto: '#chart',
      data: {
        url: link + '?zoneOffset=' + (new Date()).getTimezoneOffset(),
        mimeType: 'json',
        x: 'date',
        types: {
          wordcount: 'bar',
          daily: 'bar',
          remaining: 'line',
          charcount: 'bar',
          dailyChar: 'bar'
        },
        names: {
          date: 'Date',
          wordcount: 'Word count',
          charcount: 'Character count',
          target: 'Target',
          daily: 'Daily writing',
          dailytarget: 'Daily target',
          dailyChar: 'Daily characters',
          adjusteddailytarget: 'Adjusted daily target',
          remaining: 'Remaining wordcount'
        },
        axes: {
          charcount: 'y2',
          dailyChar: 'y2'
        },
        colors: {
          wordcount: '#674732',
          target: '#9e9e9e'
        },
        hide: (isAcc ? ['daily', 'dailytarget', 'dailyChar'] : ['wordcount', 'charcount', 'target'])
            .concat(showRem ? [] : ['remaining'])
            .concat(showAdjusted ? [] : ['adjusteddailytarget'])
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%b-%d'
          }
        },
        y: {
          label: {
            text: 'Word count',
            position: 'inner-right'
          },
          min: 0,
          padding: {
            bottom: 0
          },
          tick: {
            format: d3.format(',')
          }
        },
        y2: {
          show: true,
          label: {
            text: 'Character count',
            position: 'inner-right'
          }
        }
      },
      grid: {
        x: {
          lines: [
            { value: d3.time.day.floor(new Date()), text: 'Today', class: 'today-line' }
          ]
        },
        y: {
          show: true
        }
      },
      tooltip: {
        format: {
          title: d3.time.format('%Y-%b-%d'),
          value: d3.format(',')
        }
      }
    });
    
    $('#chart').data('chart', chart);
    
    $('#target-change')
      .data('acc', isAcc)
      .html(isAcc ? 'Show as daily writing' : 'Show as cumulative count')
      .click(function () {
        var self = $(this);
        if (self.data('acc')) {
          self.html('Show as cumulative count');
          chart.hide(['wordcount', 'target', 'charcount'], { withLegend: false });
          chart.show(['daily', 'dailytarget', 'dailyChar'], { withLegend: false });
          self.data('acc', false);
        } else {
          self.html('Show as daily writing');
          chart.hide(['dailytarget', 'daily', 'dailyChar'], { withLegend: false });
          chart.show(['target', 'wordcount', 'charcount'], { withLegend: false });
          self.data('acc', true);
        }
      });
  });
}
