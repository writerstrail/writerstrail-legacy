(function () {
  "use strict";

  var $ = window.jQuery,
      zoneOffset = (new Date()).getTimezoneOffset();

  $.getJSON('/sessions/today.json?zoneOffset=' + zoneOffset, function (data) {
    if (!data.wroteToday) {
      $('#nowrite').css('display', 'block');
    }
  });
})();