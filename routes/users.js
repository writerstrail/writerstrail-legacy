var router = require('express').Router(),
  promise = require('sequelize').Promise,
  genres = require('./users/genres'),
  projects = require('./users/projects'),
  targets = require('./users/targets'),
  sessions = require('./users/sessions'),
  settings = require('./users/settings'),
  tour = require('./users/tour'),
  stats = require('./users/stats'),
  exportdata = require('./users/export'),
  isactivated = require('../utils/middlewares/isactivated'),
  models = require('../models'),
  sendflash = require('../utils/middlewares/sendflash'),
  durationformatter = require('../utils/functions/durationformatter'),
  truncatedesc = require('../utils/functions/truncatedesc');

function durationFormatterAlt(dur) {
  var min = Math.floor(dur / 60),
    sec = dur - min * 60;

  return (min.toString() + 'm' + (sec < 10 ? '0' + sec : sec)) + 's';
}

router.use(function (req, res, next) {
  res.locals.truncatedesc = truncatedesc;
  next();
});

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
router.use('/projects', projects);
router.use('/targets', targets);
router.use('/sessions', isactivated, sessions);
router.use('/settings', isactivated, settings);
router.use('/export', isactivated, exportdata);
router.use('/', tour);
router.use('/', stats);

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
            'LEAST(100, GREATEST(0, FLOOR(' +
            'CASE WHEN `targetunit` LIKE "word"  THEN ' +
            '((`currentWordcount` + `correctwc`) / `targetwc`)' +
            'ELSE ' +
            '((`currentCharcount` + `correctcc`) / `targetcc`)' +
            'END' +
            ' * 100)))'
          ), 'percentage']
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      }, {
        raw: true
      });
    },
    getTarget = function () {
      var where = [
        { ownerId: req.user.id }
      ];

      if (req.user.settings.targetId) {
        where.push({ id: req.user.settings.targetId });
      } else {
        where.push(models.Sequelize.literal(
          '`Target`.`end` >= DATE_ADD(CURDATE(), INTERVAL `Target`.`zoneOffset` MINUTE)'));
      }

      return models.Target.findOne({
        where: where,
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
          models.Sequelize.literal('AVG(`Session`.`wordcount` / (`Session`.`duration` / 60)) AS `wpm`')
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
    renderer = function (projects, target, totalWordcount, dailyAverage, wpm, perfPeriod, perfSession, largestProject, highestWpm) {
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
  promise.join(getProjects(), getTarget(), getTotalWordcount(), getDailyAverage(), getWpm(), getPerformancePeriod(), getPerformanceSession(), getLargestProject(), getHighestWpm(), renderer)
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

module.exports = router;
