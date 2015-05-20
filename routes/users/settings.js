var router = require('express').Router(),
  _ = require('lodash'),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  isverified = require('../../utils/middlewares/isverified'),
  durationparser = require('../../utils/functions/durationparser'),
  durationformatter = require('../../utils/functions/durationformatter'),
  dateFormats = require('../../utils/data/dateformats'),
  timeFormats = require('../../utils/data/timeformats'),
  chartTypes = require('../../utils/data/charttypes');

router.get('/', sendflash, function (req, res) {
  var settings = req.flash('values');
  models.Target.findAll({
    where: [
      { ownerId: req.user.id },
      models.Sequelize.literal('`Target`.`end` >= (NOW() - INTERVAL 1 DAY + INTERVAL `Target`.`zoneOffset` MINUTE)')
    ],
    order: [['name', 'ASC']]
  }).then(function (targets) {
    res.render('user/settings/index', {
      title: 'Settings',
      section: 'settings',
      dateFormats: dateFormats,
      timeFormats: timeFormats,
      settings: settings[0] || req.user.settings,
      validate: req.flash('valerror'),
      durationformatter: durationformatter,
      dashtargets: targets
    });
  });
});

router.post('/', isverified, function (req, res, next) {
  var settings = req.user.settings,
    dateFormat = req.body.dateformat,
    timeFormat = req.body.timeformat,
    chartType = req.body.charttype,
    defaultTimer = req.body.defaultTimer = durationparser(req.body.defaultTimer),
    performanceMetric = req.body.performanceMetric,
    lothreshold = parseInt(req.body.lothreshold, 10),
    hithreshold = parseInt(req.body.hithreshold, 10);
  if (_.contains(dateFormats.data, dateFormat)) {
    settings.dateFormat = dateFormat;
  }
  if (_.contains(timeFormats.data, timeFormat)) {
    settings.timeFormat = timeFormat;
  }
  if (_.contains(chartTypes, chartType)) {
    settings.chartType = chartType;
  }
  if (!isNaN(lothreshold)) {
    settings.lothreshold = lothreshold;
  }
  if (!isNaN(hithreshold)) {
    settings.hithreshold = hithreshold;
  }
  settings.showRemaining = !!req.body.showRemaining;
  settings.showAdjusted = !!req.body.showAdjusted;
  settings.showTour = !!req.body.showTour;
  settings.defaultTimer = defaultTimer;
  settings.performanceMetric = performanceMetric;
  settings.targetId = req.body.dashtarget === 'none' ? null : req.body.dashtarget;
  req.user.settings.save().then(function () {
    req.flash('success', 'Your settings were successfully saved');
    res.redirect('back');
  }).catch(function (err) {
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