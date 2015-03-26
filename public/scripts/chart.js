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
          charcount: 'bar',
          worddaily: 'bar',
          chardaily: 'bar',
          wordremaining: 'line',
          charremaining: 'line'
        },
        names: {
          date: 'Date',
          wordcount: 'Word count',
          charcount: 'Character count',
          target: 'Target',
          worddaily: 'Daily writing',
          chardaily: 'Daily characters',
          worddailytarget: 'Daily target',
          chardailyTarget: 'Daily target',
          wordadjusteddailytarget: 'Adjusted daily target',
          charadjusteddailytarget: 'Adjusted daily target',
          wordremaining: 'Remaining wordcount',
          charremaining: 'Remaining character count'
        },
        axes: {
          charcount: 'y2',
          chardaily: 'y2',
          chardailyTarget: 'y2',
          charadjusteddailytarget: 'y2',
          charremaining: 'y2'
        },
        colors: {
          wordcount: '#674732',
          wordtarget: '#9e9e9e',
          charcount: '#674732',
          chartarget: '#9e9e9e'
        },
        hide: (isAcc ? ['worddaily', 'chardailytarget', 'worddailyTarget', 'chardaily'] : ['wordcount', 'charcount', 'wordtarget', 'chartarget'])
            .concat(showRem ? [] : ['wordremaining', 'charremaining'])
            .concat(showAdjusted ? [] : ['wordadjusteddailytarget', 'charadjusteddailytarget'])
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
          chart.hide(['wordcount', 'wordtarget', 'charcount', 'chartarget'], { withLegend: false });
          chart.show(['worddaily', 'worddailytarget', 'chardaily', 'chardailyTarget'], { withLegend: false });
          self.data('acc', false);
        } else {
          self.html('Show as daily writing');
          chart.hide(['worddaily', 'worddailytarget', 'chardaily', 'chardailyTarget'], { withLegend: false });
          chart.show(['wordcount', 'wordtarget', 'charcount', 'chartarget'], { withLegend: false });
          self.data('acc', true);
        }
      });
  });
}
