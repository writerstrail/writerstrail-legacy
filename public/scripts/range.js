/*jshint unused:false*/
function chartRange($, moment, selector, format, chartSelector, link) {
  $(function (){
    var chart = $(chartSelector).data('chart');
    var start = moment().subtract('days', 29);
    var end = moment();
    $(selector + ' #range').html(start.format(format) + ' - ' + end.format(format));
    var onChange = function (start, end) {
      $(selector + ' #range').html(start.format(format) + ' - ' + end.format(format));
      chart.load({
        url: link + '?zoneOffset=' + (new Date()).getTimezoneOffset() + '&start=' + start.format('YYYY-MM-DD') + '&end=' + end.format('YYYY-MM-DD'),
        mimeType: 'json',
        unload: true
      });
    };
    $(selector).daterangepicker(
      {
        ranges: {
         'Today': [moment(), moment()],
         'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
         'Last 7 Days': [moment().subtract('days', 6), moment()],
         'Last 30 Days': [moment().subtract('days', 29), moment()],
         'This Month': [moment().startOf('month'), moment().endOf('month')],
         'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
        },
        startDate: moment().subtract('days', 29),
        endDate: moment(),
        showDropdowns: true
      },
      onChange
    );
  });
}
