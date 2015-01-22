var router = require('express').Router(),
  _ = require('lodash'),
  sendflash = require('../../utils/middlewares/sendflash'),
  dateFormats = require('../../utils/data/dateformats'),
  chartTypes = require('../../utils/data/charttypes');

router.get('/', sendflash, function (req, res) {
  res.render('user/settings/index', {
    title: 'Settings',
    section: 'settings',
    dateFormats: dateFormats
  });
});

router.post('/', function (req, res, next) {
  var dateFormat = req.body.dateformat,
    chartType = req.body.charttype;
  console.log(chartTypes);
  if (_.contains(dateFormats, dateFormat)) {
    req.user.settings.dateFormat = dateFormat;
  }
  if (_.contains(chartTypes, chartType)) {
    req.user.settings.chartType = chartType;
  }
  req.user.settings.save().then(function () {
    req.flash('success', 'Your settings were successfully saved');
    res.redirect('back');
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;