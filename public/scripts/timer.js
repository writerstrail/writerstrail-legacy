/*jshint unused:false*/
/*global window */
(function () {

  var document, $, Highcharts, ion, moment, settings, isRunning = false;

  window.setupTimer = function setup(d, j, h, i, m, s, min, sec) {
    window.addEventListener('beforeunload', function (e) {
      if (isRunning) {
        var msg = 'Your timer is still running.';
        (e || window.event).returnValue = msg;
        return msg;
      }
      return null;
    });

    document = d;
    $ = j;
    Highcharts = h;
    ion = i;
    moment = m;
    settings = s;
    timerSetup(min, sec);
    chronometerSetup();
    modalSetup();
  };

  function timerSetup(min, sec) {
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
        chart: {
          renderTo: 'timer-min',
          type: 'solidgauge',
          animation: false
        },
        title: null,
        pane: {
          background: {
            color: '#AAAAAA',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },
        tooltip: {
          enabled: false
        },
        yAxis: {
          min: 0,
          max: 60,
          showLastLabel: false,
          title: {
            text: 'Minutes',
            y: 15
          },
          stops: [
            [0.1, '#DF5353'], // red
            [0.5, '#DDDF0D'], // yellow
            [0.9, '#55BF3B']  // green
          ]
        },
        series: [
          {
            id: 'minutes',
            name: 'Minutes',
            data: [min]
          }
        ]
      };
      var timerMin = new Highcharts.Chart(options);
      options.yAxis.title.text = 'Seconds';
      options.chart.renderTo = 'timer-sec';
      options.series = [{
        id: 'seconds',
        name: 'Seconds',
        data: [sec]
      }];
      var timerSec = new Highcharts.Chart(options);
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

      var onstop = function () {
        isRunning = false;
        var self = $('#timerstart');
        clearInterval(self.data('interval'));
        self.html('Start').removeClass('btn-danger').addClass('btn-primary');
        self.data('running', false);
        $('#timerpause').html("I'm away").data('away', false).prop('disabled', true);
        var realSeconds = (self.data('setSeconds') - self.data('seconds')),
          realMinutes = self.data('setMinutes') - self.data('minutes');

        if (realSeconds < 0) {
          realMinutes -= 1;
          realSeconds += 60;
        }

        modalShow({
          hour: 0,
          min: realMinutes,
          sec: realSeconds
        }, durationSplitter($('#timerpause').data('time')), self.data('start'), true);
      };

      $("#timerstart").data('running', false).click(function () {
        var self = $(this);
        var pause = $('#timerpause');
        var awayTimer = $('#timeraway');

        if (self.data('running')) {
          onstop();
        } else {
          isRunning = true;
          var minutes = Math.min(60, Math.max(0, parseInt($('#min').val(), 10)));
          var seconds = Math.min(59, Math.max(0, parseInt($('#sec').val(), 10)));
          self.data('start', moment());
          self.data('setMinutes', minutes);
          self.data('setSeconds', seconds);

          if (isNaN(minutes) || isNaN(seconds) || (minutes === 0 && seconds === 0)) {
            return this;
          }

          $('#min').val(minutes);
          $('#sec').val(seconds);

          self.html('Stop').removeClass('btn-primary').addClass('btn-danger');
          self.data('running', true);
          pause.html("I'm away").data('time', 0).prop('disabled', false);
          awayTimer.html(durationFormatterComplete(pause.data('time')));

          var loop = function () {
            self.data('seconds', self.data('seconds') - 1);
            if (pause.data('away')) {
              pause.data('time', pause.data('time') + 1);
              awayTimer.html(durationFormatterComplete(pause.data('time')));
            }
            if (self.data('seconds') < 0) {
              self.data('seconds', 59);
              self.data('minutes', self.data('minutes') - 1);
            }
            timerMin.get('minutes').setData([self.data('minutes')]);
            $("#rem-min").html(self.data('minutes'));
            timerSec.get('seconds').setData([self.data('seconds')]);
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

          self.data('interval', setInterval(loop, 100));
        }
      });
    });
  }

  function modalSetup() {
    $('#sessionSave').click(function () {
      $('#sessionFormFields').submit();
    });
    $('.sessionForm').keypress(function (e) {
      if (e.which === 13) {
        $('#sessionFormFields').submit();
      }
    });
    $('#sessionForm').on('shown.bs.modal', function () {
      $('#wordcount').focus();
    });
  }

  function modalShow(duration, pausedDuration, start, countdown) {
    function durationFormatter(dur) {
      return ((dur.hour || 0) * 60 + dur.min) + ':' + digitFormatter(dur.sec);
    }

    $('#zoneOffset').val(moment().utcOffset());
    $('#wordcount').val('');
    $('#charcount').val('');
    $('#summary').val('');
    $('#notes').val('');
    $('#start').val(start.format(settings.dateFormat + ' ' + settings.timeFormat));
    $('#duration').val(durationFormatter(duration));
    $('#pausedTime').val(durationFormatter(pausedDuration));
    $('#countdown').prop('checked', countdown);
    $('#sessionForm').modal();
  }

  function digitFormatter(digit) {
    return (digit < 10 ? '0' : '') + digit;
  }

  function durationSplitter(dur) {
    var hour = Math.floor(dur / 3600),
      min = Math.floor((dur - (hour * 3600)) / 60),
      sec = dur - (hour * 3600) - (min * 60);

    return {
      hour: hour,
      min: min,
      sec: sec
    };
  }

  function durationFormatterComplete(dur) {
    var d = durationSplitter(dur);

    return d.hour + ':' + digitFormatter(d.min) + ':' + digitFormatter(d.sec);
  }

  function chronometerSetup() {
    var hour = 0, min = 0, sec = 0;
    var hourHand = document.getElementById('hourHand'),
      minHand = document.getElementById('minHand'),
      secHand = document.getElementById('secHand');
    var clockHour = $('#clockHour'),
      clockMinutes = $('#clockMinutes'),
      clockSeconds = $('#clockSeconds'),
      startButton = $('#clockstart'),
      pauseButton = $('#clockpause'),
      awayTimer = $('#clockaway');

    function rotate(el, deg) {
      el.setAttribute('transform', 'rotate(' + deg + ' 50 50)');
    }

    function increaseSecond() {
      sec += 1;
      if (sec === 60) {
        sec = 0;
        min += 1;
      }
      if (min === 60) {
        min = 0;
        hour += 1;
      }
    }

    function renderClock() {
      rotate(secHand, 6 * sec);
      rotate(minHand, (6 * min) + (sec / 10));
      rotate(hourHand, (30 * (hour % 12)) + (min / 2));

      clockHour.html(hour);
      clockMinutes.html(digitFormatter(min));
      clockSeconds.html(digitFormatter(sec));
    }

    startButton.data('running', false);
    pauseButton.data('time', 0).data('paused', false).click(function () {
      if (startButton.data('running')) {
        if (pauseButton.data('paused')) {
          pauseButton.data('paused', false).html("I'm away");
        } else {
          pauseButton.data('paused', true).html("I'm back");
        }
      }
    });
    startButton.click(function () {
      if (startButton.data('running')) {
        isRunning = false;
        clearInterval(startButton.data('interval'));
        startButton
          .data('running', false)
          .html('Start')
          .removeClass('btn-danger')
          .addClass('btn-primary');
        pauseButton.prop('disabled', true).data('paused', false).html("I'm away");
        modalShow({
          hour: hour, min: min, sec: sec
        }, durationSplitter(pauseButton.data('time')), startButton.data('start'), false);
      } else {
        isRunning = true;
        startButton
          .data('running', true)
          .html('Stop')
          .data('start', moment())
          .removeClass('btn-primary')
          .addClass('btn-danger')
          .data('interval', setInterval(function () {
            increaseSecond();
            renderClock();
            if (pauseButton.data('paused')) {
              pauseButton.data('time', pauseButton.data('time') + 1);
              awayTimer.html(durationFormatterComplete(pauseButton.data('time')));
            }
          }, 1000));
        pauseButton.prop('disabled', false);
      }
    });
    $('#clockreset').click(function () {
      hour = min = sec = 0;
      pauseButton.data('time', 0);
      awayTimer.html(durationFormatterComplete(0));
      renderClock();
    });
  }
})();
