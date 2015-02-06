function buildChart(targetId, $, c3, d3, chartType, showRem, showPond) {
  linkChart('/targets/' + targetId + '/data.json', $, c3, d3, chartType, showRem, showPond);
}

function linkChart(link, $, c3, d3, chartType, showRem, showPond) {
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
          remaining: 'area'
        },
        names: {
          date: 'Date',
          wordcount: 'Word count',
          target: 'Target',
          daily: 'Daily writing',
          dailytarget: 'Daily target',
          ponddailytarget: 'Adjusted daily target',
          remaining: 'Remaining wordcount'
        },
        colors: {
          wordcount: '#674732',
          target: '#9e9e9e'
        },
        hide: (isAcc ? ['daily', 'dailytarget'] : ['wordcount', 'target'])
            .concat(showRem ? [] : ['remaining'])
            .concat(showPond ? [] : ['ponddailytarget'])
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
    
    $('#target-change')
      .data('acc', isAcc)
      .html(isAcc ? 'Show as daily writing' : 'Show as cumulative count')
      .click(function () {
        var self = $(this);
        if (self.data('acc')) {
          self.html('Show as cumulative count');
          chart.hide(['wordcount', 'target'], { withLegend: false });
          chart.show(['daily', 'dailytarget'], { withLegend: false });
          self.data('acc', false);
        } else {
          self.html('Show as daily writing');
          chart.hide(['dailytarget', 'daily'], { withLegend: false });
          chart.show(['target', 'wordcount'], { withLegend: false });
          self.data('acc', true);
        }
      });
  });
}