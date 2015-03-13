var router = require('express').Router(),
  moment = require('moment'),
  _ = require('lodash'),
  promise = require('sequelize').Promise,
  genres = require('./users/genres'),
  projects = require('./users/projects'),
  targets = require('./users/targets'),
  sessions = require('./users/sessions'),
  settings = require('./users/settings'),
  tour = require('./users/tour'),
  isactivated = require('../utils/middlewares/isactivated'),
  models = require('../models'),
  sendflash = require('../utils/middlewares/sendflash'),
  durationformatter = require('../utils/functions/durationformatter');

function durationFormatterAlt(dur) {
  var min = Math.floor(dur / 60),
    sec = dur - min * 60;
  
  return (min.toString() +  'm' + (sec < 10 ? '0' + sec : sec)) + 's';
}

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

router.use('/genres', isactivated, genres);
router.use('/projects', isactivated, projects);
router.use('/targets', isactivated, targets);
router.use('/sessions', isactivated, sessions);
router.use('/settings', isactivated, settings);
router.use('/', tour);

router.get('/dashboard', isactivated, sendflash, function (req, res, next) {
  var performanceOrder = (req.user.settings.performanceMetric === 'real' ? 'realP' : 'p') + 'erformance',
    getProjects = function () {  
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
    getTodaySessions = function () {
      return models.Session.findOne({
        where: models.Sequelize.literal('DATE(`Session`.`start` - INTERVAL `Session`.`zoneOffset` MINUTE) = CURDATE()'),
        attributes: ['id'],
        include: [{
          model: models.Project,
          as: 'project',
          where: {
            ownerId: req.user.id
          },
          required: true,
          attributes: []
        }]
      }, {
        raw: true
      });
    },
    getTarget = function () {
      return models.Target.findOne({
        where: [
          { ownerId: req.user.id },
          models.Sequelize.literal(
              '`Target`.`end` >= DATE_ADD(CURDATE(), INTERVAL `Target`.`zoneOffset` MINUTE)')
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
    getDailyAverage = function () {
      return models.sequelize.query("SELECT AVG(`average` * `total`) AS `dailyAverage` FROM dailyAverages WHERE ownerId = " + req.user.id + " LIMIT 1;", null, { raw: true });
    },
    getWpm = function () {
      return models.Session.findAll({
        attributes: [
          models.Sequelize.literal('AVG(`Session`.`wordcount` / (`Session`.`duration` / 60)) AS `wpm`'),
        ],
        include: [{
          model: models.Project,
          as: 'project',
          where: {
            ownerId: req.user.id
          },
          attributes: []
        }],
        where: {
          duration: {
            ne: null
          }
        }
      }, {
        raw: true
      });
    },
    getPerformancePeriod = function () {
      return models.sequelize.query("SELECT * FROM periodPerformance WHERE ownerId = " + req.user.id + " ORDER BY `" + performanceOrder + "` DESC LIMIT 1;", null, { raw: true });
    },
    getPerformanceSession = function () {
      return models.sequelize.query("SELECT * FROM sessionPerformance WHERE ownerId = " + req.user.id + " ORDER BY `" + performanceOrder + "` DESC LIMIT 1;", null, { raw: true });
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
    getHighestWpm = function () {
      return models.sequelize.query("SELECT `s`.`id` AS `sessionId`, (`s`.`wordcount` / (`s`.`duration` / 60)) as `performance`, (`s`.`wordcount` / ((`s`.`duration` - `s`.`pausedTime`) / 60)) as `realPerformance`,  ROUND(`s`.`duration` / 60) AS  `minuteDuration`, `s`.`wordcount` AS `sessionWordcount`, CASE WHEN `s`.`isCountdown` = 1 THEN 'countdown' ELSE 'forward' END AS `direction`, `p`.`id` AS `projectId`, `p`.`name` AS `projectName` FROM `writingSessions` `s` INNER JOIN `projects` `p` ON `p`.`deletedAt` IS NULL AND `p`.`id` = `s`.`projectId` WHERE `s`.`deletedAt` IS NULL AND `s`.`duration` IS NOT NULL AND ROUND(`s`.`duration` / 60) > 0 AND  `p`.`ownerId` = " + req.user.id + " ORDER BY " + performanceOrder + " DESC LIMIT 1");
    },
    renderer = function (projects, todaySessions, target, totalWordcount, dailyAverage, wpm, perfPeriod, perfSession, largestProject, highestWpm) {
      if (!todaySessions || todaySessions.length === 0) {
        res.locals.errorMessage.push('You didn\'t write anything today. <a href="/timer" class="alert-link">Fix this and write now</a>.');
      }
      res.render('user/dashboard', {
        title: 'Dashboard',
        section: 'dashboard',
        projects: projects,
        target: target,
        stats: {
          totalWordcount: totalWordcount,
          dailyAverage: dailyAverage.length > 0 && dailyAverage[0].dailyAverage ? dailyAverage[0].dailyAverage : 0,
          wpm: wpm.length > 0 && wpm[0].wpm ? wpm[0].wpm : 0,
          period: perfPeriod.length > 0 ? perfPeriod[0] : null,
          session: perfSession.length > 0 ? perfSession[0] : null,
          largestProject: largestProject,
          highestWpm: highestWpm.length > 0 ? highestWpm[0] : null
        },
        durationFormatter: durationFormatterAlt
      });
    };
  promise.join(getProjects(), getTodaySessions(), getTarget(), getTotalWordcount(), getDailyAverage(), getWpm(), getPerformancePeriod(), getPerformanceSession(), getLargestProject(), getHighestWpm(), renderer)
  .catch(function (err) {
    next(err);
  });
});

router.get('/timer', isactivated, sendflash, function (req, res, next) {
  models.Project.findAll({
    where: {
      ownerId: req.user.id
    }
  }).then(function (projects) {
    var timer = durationformatter(req.user.settings.defaultTimer).split(':');
    if (projects.length === 0) {
      res.locals.errorMessage.push('No project to make a session for. <strong><a href="/projects/new" class="alert-link">Create a new one now</a></strong>.');
    }
    res.render('user/timer', {
      title: 'Timer',
      section: 'timer',
      minutes: parseInt(timer[0], 10),
      seconds: parseInt(timer[1], 10),
      projects: projects
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/stats', isactivated, sendflash, function (req, res, next) {
  var getYearSummary = function () {
        return models.Session.findAll({
          where: {
            start: {
              gte: moment().subtract(1, 'year').toDate()
            }
          },
          attributes: [
            models.Sequelize.literal('SUM(`Session`.`wordcount`) AS dailyCount'),
            models.Sequelize.literal('DATE(`Session`.`start`) AS day'),
            'zoneOffset'
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
      getTotalWordcount = function () {
        return models.Project.sum('currentWordcount', {
          where: {
            ownerId: req.user.id
          }
        });
      },
      getEarliestSession = function () {
        return models.Session.findOne({
          include: [{
            model: models.Project,
            as: 'project',
            where: {
              ownerId: req.user.id
            }
          }],
          order: [['start', 'ASC']]
        });
      },
      getLargestProject = function () {
        return models.Project.findOne({
          where: {
            ownerId: req.user.id
          },
          order: [['currentWordcount', 'DESC']]
        });
      },
      renderer = function (yearSessions, totalWordcount, earliestSession, largestProject) {
        var yearly = {}, larger = 0;

        _.forEach(yearSessions, function (session) {
          yearly[((+session.day / 1000) - (session.zoneOffset * 60)).toString()] = session.dailyCount;
          larger = session.dailyCount > larger ? session.dailyCount : larger;
        });

        res.render('user/stats', {
          title: 'Statistics',
          section: 'stats',
          data: {
            sessions: yearly,
            legend: [
              Math.round(larger * 1 / 5),
              Math.round(larger * 2 / 5),
              Math.round(larger * 3 / 5),
              Math.round(larger * 4 / 5),
            ]
          },
          tops: {
            totalWordcount: totalWordcount,
            since: earliestSession.start,
            largestProject: largestProject
          }
        });
      };
  promise.join(getYearSummary(), getTotalWordcount(), getEarliestSession(), getLargestProject(), renderer)
  .catch(next);
});

module.exports = router;
