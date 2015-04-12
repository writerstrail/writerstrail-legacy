/* globals $, projectId, csrf, document */
$(function () {
  function sendAlert(type, message) {
    var $alert = '<div class="alert alert-' + type + '">' +
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
      '<span aria-hidden="true">&times;</span>' +
      '</button>' +
      message + '</div>';

    $('#alerts').append($alert);
  }

  function correctSend(type, value) {
    return function () {
      var data = {
        _csrf: csrf
      };
      data['correct' + type] = typeof value === 'function' ? value() : value;
      $('#correct' + type + 'loading').show();
      $.post('/projects/' + projectId + '/correct' + type, data)
        .always(function () {
        $('#correct' + type + 'loading').hide();
      }).fail(function (response) {
        $('#correct' + type + 'block').addClass('has-error');
        $('#correct' + type + 'help').html(response.responseJSON.error);
        $('#correct' + type ).focus();
      }).done(function () {
        document.location.reload();
      });
    };
  }

  $('#correctwclink').on('click', function (e) {
    e.preventDefault();
    $('#correctwcblock').toggle();
  });

  $('#correctwccancel').on('click', function () {
    $('#correctwcblock').hide();
  });

  $('#correctwcsave').on('click', correctSend('wc', function () {
    return $('#correctwc').val();
  }));

  $('#correctwcreset').on('click', correctSend('wc', 'reset'));

  $('#correctcclink').on('click', function (e) {
    e.preventDefault();
    $('#correctccblock').toggle();
  });

  $('#correctcccancel').on('click', function () {
    $('#correctccblock').hide();
  });

  $('#correctccsave').on('click', function () {
    $('#correctccloading').show();
  });
});
