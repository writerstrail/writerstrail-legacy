/* globals $ */
$(function () {
  $('#correctwclink').on('click', function (e) {
    e.preventDefault();
    $('#correctwcblock').toggle();
  });

  $('#correctwccancel').on('click', function () {
    $('#correctwcblock').hide();
  });

  $('#correctwcsave').on('click', function () {
    $('#correctwcloading').show();
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
