function timerSetup($, c3, ion) {
  $(function () {
    ion.sound({
      sounds: [
        {
          name: 'timer'
        }
      ],
      path: '/sounds/',
      preload: true
    });
    
    var options = {
      bindto: '#timer-min',
      data: {
        columns: [
          ['elapsed', 45],
          ['remaining', 15]
        ],
        type : 'donut',
        order: null,
        colors: {
          remaining: '#337AB7',
          elapsed: 'gray'
        }
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
      },
      transition: {
        duration: 0
      }
    };
    var timerMin = c3.generate(options);
    options.donut.title = 'Seconds';
    options.bindto = '#timer-sec';
    options.data.columns = [
      ['elapsed', 60],
      ['remaining', 0]
    ];
    var timerSec = c3.generate(options);
    $('#timerpause').data('away', false).data('time', 0).click(function () {
      var self = $(this);
      if ($('#timerstart').data('running')) {
        if (self.data('away')) {
          self.data('away', false).html("I'm away");
        } else {
          self.data('away', true).html("I'm back");
        }
      }
    });
    
    var onstop = function (){
      var self = $('#timerstart');
      clearInterval(self.data('interval'));
      self.html('Start').removeClass('btn-danger').addClass('btn-primary');
      self.data('running', false);
      $('#timerpause').html("I'm away").data('away', false).prop('disabled', true);
    };
    
    $('#timer-min').data('c3', timerMin);
    $("#timerstart").data('running', false).click(function () {
      var self = $(this);
      var pause = $('#timerpause');
      
      if (self.data('running')) {
        onstop();
      } else {
        var minutes = Math.min(60, Math.max(0, parseInt($('#min').val(), 10)));
        var seconds = Math.min(59, Math.max(0, parseInt($('#sec').val(), 10)));
        
        if (isNaN(minutes) || isNaN(seconds) || (minutes === 0 && seconds === 0)) {
          return this;
        }
        
        $('#min').val(minutes);
        $('#sec').val(seconds);
        
        
        self.html('Stop').removeClass('btn-primary').addClass('btn-danger');
        self.data('running', true);
        pause.html("I'm away").data('time', 0).prop('disabled', false);
        
        var loop = function () {
            self.data('seconds', self.data('seconds') - 1);
            if (pause.data('away')) {
              pause.data('time', pause.data('time') + 1);
            }
            if (self.data('seconds') < 0) {
              self.data('seconds', 59);
              self.data('minutes', self.data('minutes') - 1);
            }
            timerMin.load({
              columns: [
                ['elapsed', 60 - self.data('minutes')],
                ['remaining', self.data('minutes')]
              ],
              order: null
            });
            $("#rem-min").html(self.data('minutes'));
            timerSec.load({
              columns: [
                ['elapsed', 60 - self.data('seconds')],
                ['remaining', self.data('seconds')]
              ]
            });
            $("#rem-sec").html(self.data('seconds'));
            if (self.data('minutes') === 0 && self.data('seconds') === 0) {
              clearInterval(self.data('interval'));
              ion.sound.play('timer');
              onstop();
            }
          };

        self.data('minutes', minutes);
        self.data('seconds', seconds + 1);
        loop();

        self.data('interval', setInterval(loop, 1000));
      }
    });
  });
}