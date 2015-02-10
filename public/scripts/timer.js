function timerSetup($, c3, d3, selector) {
  $(function () {
    var timer = c3.generate({
      bindto: selector,
      data: {
        columns: [
          ['data2', 0],
          ['data1', 1 * 60]
        ],
        type : 'donut',
        order: null
      },
      donut: {
        title: "Countdown",
        label: {
          show: false
        }
      },
      legend: {
        hide: true
      },
      interaction: {
        enabled: false
      }
    });
    $(selector).data('c3', timer);
    $("#timerstart").click(function () {
      console.log('STARTED!!!');
      var self = $(this);
      var total = Math.max(0, (parseInt($('#min').val(), 10) * 60) + parseInt($('#sec').val(), 10));
      self.data('time', total);
      self.data('interval', setInterval(function () {
        self.data('time', self.data('time') - 1);
        console.log('time', self.data('time'));
        console.log('diff', total - self.data('time'));
        timer.load({
          columns: [
            ['data2', total - self.data('time')],
            ['data1', self.data('time')]
          ]
        });
        if (self.data('time') === 0) {
          clearInterval(self.data('interval'));
        }
      }, 1000));
    });
  });
}