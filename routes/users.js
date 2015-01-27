var router = require('express').Router(),
  promise = require('sequelize').Promise,
  _ = require('lodash'),
  //moment = require('moment'),
  genres = require('./users/genres'),
  projects = require('./users/projects'),
  targets = require('./users/targets'),
  sessions = require('./users/sessions'),
  settings = require('./users/settings'),
  isactivated = require('../utils/middlewares/isactivated'),
  models = require('../models'),
  sendflash = require('../utils/middlewares/sendflash');

function durationFormatterAlt(dur) {
  var min = Math.floor(dur / 60),
    sec = dur - min * 60;
  
  return (min.toString() +  'm' + (sec < 10 ? '0' + sec : sec)) + 's';
}

function getPeriodFromName(period) {
  switch (period) {
    case 'early morning': {
      return '00:00:00&mdash;05:59:59';
    }
    case 'morning': {
      return '06:00:00&mdash;11:59:59';
    }
    case 'afternoon': {
      return '12:00:00&mdash;17:59:59';
    }
    case 'evening': {
      return '18:00:00&mdash;23:59:59';
    }
    default: {
      return '';
    }
  }
}

router.use(isactivated);

router.param('id', function (req, res, next, id) {
  var regex = /\d+/;
  if (regex.test(id)) {
    next();
  } else {
    var err = new Error('Not found');
    err.status = 404;
    next(err);
  }
});

router.use(genres);
router.use('/projects', projects);
router.use(targets);
router.use(sessions);
router.use('/settings', settings);

router.get('/dashboard', sendflash, function (req, res, next) {
  var getProjects = function () {  
      return models.Project.findAll({
        where: {
          ownerId: req.user.id,
          active: true
        },
        attributes: [
          models.Sequelize.literal('*'),
          [models.Sequelize.literal(
            'LEAST(100, GREATEST(0, FLOOR((`currentWordcount` / `targetwc`) * 100)))'
          ), 'percentage']
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      }, {
        raw: true
      });
    },
    getTarget = function () {
      return models.Target.findOne({
        where: [
          { ownerId: req.user.id },
          models.Sequelize.literal(
              'CASE WHEN `Target`.`zoneOffset` IS NOT NULL THEN `Target`.`end` >= DATE_SUB(NOW(), INTERVAL `Target`.`zoneOffset` MINUTE) ' +
              'ELSE `Target`.`end` >= NOW() END')
        ],
        order: [['end', 'ASC']]
      }, {
        raw: true
      });
    },
    getTotalWordcount = function () {
      return models.Project.sum('currentWordcount', {
        where: {
          ownerId: req.user.id
        }
      });
    },
    getDailyCounts = function () {
      return models.Session.findAll({
        attributes: [
          models.Sequelize.literal('SUM(`Session`.`wordcount`) AS `dailyCount`'),
          models.Sequelize.literal('(SUM(`Session`.`duration`) / 60) AS `totalDuration`'),
          models.Sequelize.literal('DATE(`Session`.`start`) AS `date`')
        ],
        include: [{
          model: models.Project,
          as: 'project',
          where: {
            ownerId: req.user.id
          }
        }],
        group: [models.Sequelize.literal('DATE(`Session`.`start`)')]
      }, {
        raw: true
      });
    },
    getPerformancePeriod = function () {
      return models.sequelize.query("SELECT AVG(s.wordcount / (s.duration / 60)) AS performance, CASE WHEN TIME(start) BETWEEN '06:00:00' AND '11:59:59' THEN 'morning' WHEN TIME(start) BETWEEN '12:00:00' AND '17:59:59' THEN 'afternoon' WHEN TIME(start) BETWEEN '18:00:00' AND '23:59:59' THEN 'evening' WHEN TIME(start) BETWEEN '00:00:00' AND '5:59:59' THEN 'early morning' END AS period FROM writingSessions s INNER JOIN projects p ON p.id = s.projectId AND p.ownerId = " + req.user.id + " GROUP BY period ORDER BY performance DESC LIMIT 1");
    },
    getPerformanceSession = function () {
      return models.sequelize.query("SELECT AVG(s.wordcount / (s.duration / 60)) AS performance, CASE WHEN isCountdown = 0 THEN 'forward' ELSE 'countdown' END AS direction, duration FROM writingSessions s INNER JOIN projects p ON p.id = s.projectId AND p.ownerId = " + req.user.id + " GROUP BY duration, isCountdown ORDER BY performance DESC LIMIT 1;");
    },
    getLargestProject = function () {
      return models.Project.findOne({
        where: {
          ownerId: req.user.id
        },
        order: [['currentWordcount', 'DESC']]
      }, {
        raw: true
      });
    },
    renderer = function (projects, target, totalWordcount, dailyCounts, perfPeriod, perfSession, largestProject) {
      var totalDailyCounts = _.reduce(dailyCounts, function (acc, d) { return acc + d.dailyCount; }, 0),
        totalDuration = _.reduce(dailyCounts, function (acc, d) { return acc + d.totalDuration; }, 0);
      res.render('user/dashboard', {
        title: 'Dashboard',
        section: 'dashboard',
        projects: projects,
        target: target,
        stats: {
          totalWordcount: totalWordcount,
          dailyAverage: dailyCounts.length > 0 ? totalDailyCounts / dailyCounts.length : 0,
          wpm: dailyCounts.length > 0 ? totalDailyCounts / totalDuration : 0,
          period: perfPeriod.length > 0 ? perfPeriod[0] : null,
          session: perfSession.length > 0 ? perfSession[0] : null,
          largestProject: largestProject
        },
        durationFormatter: durationFormatterAlt,
        getPeriodFromName: getPeriodFromName
      });
    };
  promise.join(getProjects(), getTarget(), getTotalWordcount(), getDailyCounts(), getPerformancePeriod(), getPerformanceSession(), getLargestProject(), renderer)
  .catch(function (err) {
    next(err);
  });
});

module.exports = router;