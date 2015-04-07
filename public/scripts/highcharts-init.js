/* globals exports, window */
(function () {
  var options = {
    credits: {
      target: '_blank',
      text: 'Writer\'s Trail',
      href: 'http://writerstrail.georgemarques.com.br'
    }
  };

  if (typeof window !== 'undefined' && window.Highcharts) {
    window.Highcharts.wrap(window.Highcharts.Chart.prototype, 'showCredits', function (proceed, credits) {
      proceed.call(this, credits);

      if (this.credits && credits.target) {
        this.credits.on('click', function () {
          window.$('<a>').attr({
            href: credits.href,
            target: credits.target
          })[0].click();
        });
      }
    });
    window.Highcharts.setOptions(options);
  } else if (typeof exports !== 'undefined') {
    exports.options = options;
  }
})();
