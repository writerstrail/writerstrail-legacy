var router = require('express').Router(),
  moment = require('moment'),
  isactivated = require('../../utils/middlewares/isactivated'),
  sendflash = require('../../utils/middlewares/sendflash'),
  sampleProjects = require('../../utils/data/sample/projects'),
  sampleTarget = require('../../utils/data/sample/target'),
  sampleDaily = require('../../utils/data/sample/targetdaily');

router.get('/example/dashboard', isactivated, sendflash, function (req, res) {
  res.render('user/dashboard', {
    title: 'Dashboard',
    section: 'dashboard',
    example: true,
    projects: sampleProjects,
    target: sampleTarget,
    stats: {
      totalWordcount: 123456,
      dailyAverage: 733.42,
      wpm: 36.32,
      period: { period: 'night', start: '21:00:00', end: '04:59:59', performance: 43.98},
      session: { minuteDuration: 20, direction: 'countdown', performance: 45.38 },
      largestProject: {
        id: 0,
        name: 'Moby Dick',
        currentWordcount: 45678
      }
  }
  });
});

router.get('/example/targetdata.json', isactivated, function (req, res) {
  var target = sampleTarget;
  var totalDays = sampleDaily.length;
  var daysRange = [];
  var daily = sampleDaily;
  var wordcount = [], accWc = 0;
  var targetAcc = [], accTgt = 0;
  var dailytarget = [];
  var pondDailyTarget = [];
  var remaining = [];
  
  var startMoment = moment.utc().subtract(parseInt(req.query.zoneOffset, 10), 'minutes').subtract(19, 'days').toDate();
  
  for (var i = 1; i <= totalDays; i++) {
    var workingDate = moment.utc(startMoment).add(i - 1, 'days');
    var today = workingDate.format('YYYY-MM-DD');
    var diffWc = target.wordcount - accWc;
    var diffDays = totalDays - i + 1;
    var pondTarget = Math.floor(diffWc / diffDays) + (diffWc % diffDays < i ? 0 : 1);
    pondDailyTarget.push(Math.max(0, pondTarget));
    daysRange.push(today);
    var todayWc = daily[i - 1];
    accWc += todayWc;
    if (moment.utc().subtract(req.query.zoneOffset || 0, 'minutes').diff(workingDate) > 0) {
      wordcount.push(accWc);
    } else {
      wordcount.push(null);
    }
    var incTarget = Math.floor(target.wordcount / totalDays) + (target.wordcount % totalDays < i ? 0 : 1);
    dailytarget.push(incTarget);
    accTgt += incTarget;
    targetAcc.push(accTgt);
    remaining.push(Math.max(0, target.wordcount - accWc));
  }
  
  var result = {
    date: daysRange,
    wordcount: wordcount,
    target: targetAcc,
    daily: daily,
    dailytarget: dailytarget,
    ponddailytarget: pondDailyTarget,
    remaining: remaining
  };
  res.json(result).end();
});

router.get('/tour/ended', isactivated, function (req, res, next) {
  req.user.settings.updateAttributes({
    showTour: false
  }).then(function () {
    res.redirect('back');
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;