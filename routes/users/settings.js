var router = require('express').Router(),
  _ = require('lodash'),
  sendflash = require('../../utils/middlewares/sendflash'),
  isverified = require('../../utils/middlewares/isverified'),
  durationparser = require('../../utils/functions/durationparser'),
  durationformatter = require('../../utils/functions/durationformatter'),
  dateFormats = require('../../utils/data/dateformats'),
  timeFormats = require('../../utils/data/timeformats'),
  chartTypes = require('../../utils/data/charttypes');

router.get('/', sendflash, function (req, res) {
  var settings = req.flash('values');
  res.render('user/settings/index', {
    title: 'Settings',
    section: 'settings',
    dateFormats: dateFormats,
    timeFormats: timeFormats,
    settings: settings[0] || req.user.settings,
    validate: req.flash('valerror'),
    durationformatter: durationformatter
  });
});

router.post('/', isverified, function (req, res, next) {
  var settings = req.user.settings,
    dateFormat = req.body.dateformat,
    timeFormat = req.body.timeformat,
    chartType = req.body.charttype,
    defaultTimer = req.body.defaultTimer = durationparser(req.body.defaultTimer);
  if (_.contains(dateFormats.data, dateFormat)) {
    settings.dateFormat = dateFormat;
  }
  if (_.contains(timeFormats.data, timeFormat)) {
    settings.timeFormat = timeFormat;
  }
  if (_.contains(chartTypes, chartType)) {
    settings.chartType = chartType;
  }
  settings.showRemaining = !!req.body.showRemaining;
  settings.showAdjusted = !!req.body.showAdjusted;
  settings.showTour = !!req.body.showTour;
  settings.defaultTimer = defaultTimer;
  console.log('-----val', defaultTimer);
  req.user.settings.save().then(function () {
    req.flash('success', 'Your settings were successfully saved');
    res.redirect('back');
  }).catch(function (err) {
    console.log('----er', err);
    if (err.name === 'SequelizeValidationError') {
      req.flash('error', 'There are invalid values');
      req.flash('valerror', err.errors);
      req.flash('values', req.body);
      res.redirect('back');
    } else {
      next(err);
    }
  });
});

module.exports = router;