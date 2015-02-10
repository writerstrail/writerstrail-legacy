function timerSetup($, c3) {
  $(function () {
    var options = {
      bindto: '#timer-min',
      data: {
        columns: [
          ['remaining', 0],
          ['elapsed', 100]
        ],
        type : 'donut',
        order: null
      },
      donut: {
        title: "Minutes",
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
    };
    var timerMin = c3.generate(options);
    options.donut.title = 'Seconds';
    options.bindto = '#timer-sec';
    var timerSec = c3.generate(options);
    
    $('#timer-min').data('c3', timerMin);
    $("#timerstart").click(function () {
      console.log('STARTED!!!');
      var self = $(this);
      
      var minutes = Math.max(0, parseInt($('#min').val(), 10));
      var seconds = Math.max(0, parseInt($('#sec').val(), 10));
      
      self.data('minutes', minutes);
      self.data('seconds', seconds);
      
      self.data('interval', setInterval(function () {
        self.data('seconds', self.data('seconds') - 1);
        
        if (self.data('seconds') < 0) {
          self.data('seconds', 59);
          self.data('minutes', self.data('minutes') - 1);
        }
        
        console.log('min', self.data('minutes'));
        console.log('sec', self.data('seconds'));
        console.log('minStart', minutes);
        console.log('secStart', seconds);
        timerMin.load({
          columns: [
            ['remaining', minutes - self.data('minutes')],
            ['elapsed', self.data('minutes')]
          ]
        });
        timerSec.load({
          columns: [
            ['remaining', 60 - self.data('seconds')],
            ['elapsed', self.data('seconds')]
          ]
        });
        if (self.data('minutes') === 0 && self.data('seconds') === 0) {
          clearInterval(self.data('interval'));
        }
      }, 1000));
    });
  });
}