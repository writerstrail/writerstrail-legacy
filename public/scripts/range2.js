/*jshint unused:false*/
window.chartRange2 = function chartRange2($, moment, selector, format, chartSelector, link) {
  $(function (){
    var chart = $(chartSelector);
    var start = moment().subtract(29, 'days');
    var end = moment();
    $(selector + ' #range').html(start.format(format) + ' - ' + end.format(format));
    var onChange = function (start, end) {
      var high = chart.highcharts();
      $(selector + ' #range').html(start.format(format) + ' - ' + end.format(format));
      var newLink = link + '?zoneOffset=' + (new Date()).getTimezoneOffset() + '&start=' + start.format('YYYY-MM-DD') + '&end=' + end.format('YYYY-MM-DD')
      high.showLoading();
      $.getJSON(newLink, function (data) {
        var start = window.startFromDate(data.date[0]),
            end = window.startFromDate(data.date[data.date.length - 1]),
            isAcc = $('#target-change').data('acc');

        var x = high.xAxis[0];
        x.options.startOnTick = false;
        x.options.endOnTick = false;
        x.setExtremes(start, end, true);

        var toDelete = high.series.map(function (ser) {
          return ser;
        });
        var series = window.buildMeta(data, isAcc);
        series.forEach(function (ser) {
          high.addSeries(ser, false);
        });
        toDelete.forEach(function (ser) {
          ser.remove(false);
        });
        console.log('dates', start, end);

        high.redraw();

        high.hideLoading();
        console.log('ext', high.xAxis[0].getExtremes());
      });
    };
    $(selector).daterangepicker(
      {
        ranges: {
         'Today': [moment(), moment()],
         'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
         'Last 7 Days': [moment().subtract(6, 'days'), moment()],
         'Last 30 Days': [moment().subtract(29, 'days'), moment()],
         'This Month': [moment().startOf('month'), moment().endOf('month')],
         'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: moment().subtract(29, 'days'),
        endDate: moment(),
        showDropdowns: true
      },
      onChange
    );
  });
};
