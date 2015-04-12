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

  $('#correctwclink').on('click', function (e) {
    e.preventDefault();
    $('#correctwcblock').toggle();
  });

  $('#correctwccancel').on('click', function () {
    $('#correctwcblock').hide();
  });

  $('#correctwcsave').on('click', function () {
    $('#correctwcloading').show();
    $.post('/projects/' + projectId + '/correctwc', {
      _csrf: csrf,
      correctwc: $('#correctwc').val()
    }).always(function () {
      $('#correctwcloading').hide();
    }).fail(function (response) {
      $('#correctwcblock').addClass('has-error');
      $('#correctwchelp').html(response.responseJSON.error);
      $('#correctwc').focus();
    }).done(function (data) {
      document.location.reload();
    });
  });

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
