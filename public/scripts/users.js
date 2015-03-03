/* globals jQuery */
(function ($) {
  "use strict";

  $("#select_all").click(function () {
    var el = $(this);
    var selection = $('.selection');
    var tr = $('#users .tr');

    if (this.checked) {
      selection.prop('checked', true);
      tr.addClass('success');
    } else {
      selection.prop('checked', false);
      tr.removeClass('success');
    }

    el.prop('indeterminate', false);
  });

  $(".selection").change(function () {
    var selection = $('.selection:checked');
    var all = $('.selection');
    var el = $('#select_all');

    if (selection.length === 0) {
      el.prop('checked', 0);
      el.prop('indeterminate', false);
    } else {
      if (selection.length < all.length) {
        el.prop('checked', 0);
        el.prop('indeterminate', true);
      } else {
        el.prop('checked', 1);
        el.prop('indeterminate', false);
      }
    }
    if (this.checked) {
      $(this).closest('tr').addClass('success');
    } else {
      $(this).closest('tr').removeClass('success');
    }
  });

  $("#users tr").click(function (event) {
    if (event.target.type !== 'checkbox' &&
        event.target.nodeName !== 'BUTTON' &&
        event.target.nodeName !== 'A') {
      $(':checkbox', this).trigger('click');
    }
  });

  $('#actlist').click(function () {
    this.focus();
    this.select();
  });
})(jQuery);
