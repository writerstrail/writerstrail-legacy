function buildChart(targetId, $, c3, d3) {
  $(function() {
    var chart = c3.generate({
      bindto: '#chart',
      data: {
        url: '/targets/' + targetId + '/data.json',
        mimeType: 'json',
        x: 'date',
        types: {
          wordcount: 'bar',
          daily: 'bar'
        },
        names: {
          date: 'Date',
          wordcount: 'Word count',
          target: 'Target',
          daily: 'Daily writing',
          dailytarget: 'Daily target'
        },
        colors: {
          wordcount: '#674732',
          target: '#9e9e9e'
        },
        hide: ['daily', 'dailytarget']
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
        y: {
          show: true
        }
      },
      tooltip: {
        format: {
          title: d3.time.format('%Y-%b-%d'),
          value: function (value) {
            return d3.format(',')(value);
          }
        }
      }
    });
    
    $('#target-change')
      .data('acc', true)
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