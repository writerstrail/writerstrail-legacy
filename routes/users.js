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

function titleCase(string) {
  var pieces = string.split(' ').map(function (piece) {
    return piece.charAt(0).toUpperCase() + piece.substring(1);
  });
  return pieces.join(' ');
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
router.use('/projects', projects);
router.use('/targets', targets);
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

router.get('/stats', isactivated, sendflash, function (req, res, next) {
  var performanceOrder = (req.user.settings.performanceMetric === 'real' ? 'realP' : 'p') + 'erformance',
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
      getPerformancePeriod = function () {
        return models.sequelize.query("SELECT * FROM periodPerformance WHERE ownerId = " + req.user.id + " ORDER BY `" + performanceOrder + "` DESC LIMIT 1;", null, { raw: true });
      },
      getPerformanceSession = function () {
        return models.sequelize.query("SELECT * FROM sessionPerformance WHERE ownerId = " + req.user.id + " ORDER BY `" + performanceOrder + "` DESC LIMIT 1;", null, { raw: true });
      },
      getHighestWpm = function () {
        return models.sequelize.query("SELECT `s`.`id` AS `sessionId`, (`s`.`wordcount` / (`s`.`duration` / 60)) as `performance`, (`s`.`wordcount` / ((`s`.`duration` - `s`.`pausedTime`) / 60)) as `realPerformance`,  ROUND(`s`.`duration` / 60) AS  `minuteDuration`, `s`.`wordcount` AS `sessionWordcount`, CASE WHEN `s`.`isCountdown` = 1 THEN 'countdown' ELSE 'forward' END AS `direction`, `p`.`id` AS `projectId`, `p`.`name` AS `projectName` FROM `writingSessions` `s` INNER JOIN `projects` `p` ON `p`.`deletedAt` IS NULL AND `p`.`id` = `s`.`projectId` WHERE `s`.`deletedAt` IS NULL AND `s`.`duration` IS NOT NULL AND ROUND(`s`.`duration` / 60) > 0 AND  `p`.`ownerId` = " + req.user.id + " ORDER BY " + performanceOrder + " DESC LIMIT 1");
      },
      getBestDate = function () {
        return models.Session.findOne({
          attributes: [
            models.Sequelize.literal('DATE(`Session`.`start`) AS `bestDate`'),
            models.Sequelize.literal('SUM(`Session`.`wordcount`) AS `dailyWordcount`')
          ],
          include: [{
            model: models.Project,
            as: 'project',
            where: {
              ownerId: req.user.id
            },
            attributes: []
          }],
          group: [
            models.Sequelize.literal('DATE(`Session`.`start`)')
          ],
          order: [
            models.Sequelize.literal('`dailyWordcount` DESC')
          ]
        }, {
          raw: true
        });
      },
      getProjectAvg = function () {
        return models.Project.findOne({
          where: {
            ownerId: req.user.id
          },
          attributes: [
            models.Sequelize.literal('AVG(`Project`.`currentWordcount`) AS `wordcountAverage`')
          ]
        }, {
          raw: true
        });
      },
      getPerformanceAvg = function () {
        return models.sequelize.query("SELECT AVG(`" + performanceOrder + "`) AS `wpmAverage` FROM sessionPerformance WHERE ownerId = " + req.user.id, null, { raw: true });
      },
      getDailyAverage = function () {
        return models.sequelize.query("SELECT AVG(`average` * `total`) AS `dailyAverage` FROM dailyAverages WHERE ownerId = " + req.user.id + " LIMIT 1;", null, { raw: true });
      },
      getModePeriod = function () {
        return models.sequelize.query("SELECT * FROM periodPerformance WHERE ownerId = " + req.user.id + " ORDER BY `totalSessions` DESC LIMIT 1;", null, { raw: true });
      },
      getModeSession = function () {
        return models.sequelize.query("SELECT * FROM sessionPerformance WHERE ownerId = " + req.user.id + " ORDER BY `totalSessions` DESC LIMIT 1;", null, { raw: true });
      },
      getModeProject = function () {
        return models.Session.findOne({
          include: [{
            model: models.Project,
            as: 'project',
            where: {
              ownerId: req.user.id
            }
          }],
          attributes: [
            models.Sequelize.literal('COUNT(`Session`.`id`) AS `totalSessions`')
          ],
          group: [
            models.Sequelize.literal('`project`.`id`')
          ]
        }, {
          raw: true
        });
      },
      renderer = function (totalWordcount, earliestSession, largestProject, performancePeriod, performanceSession,
                           highestWpm, bestDate, projectAvg, performanceAvg, dailyAvg, modePeriod, modeSession, modeProject) {

        res.render('user/stats', {
          title: 'Statistics',
          section: 'stats',
          tops: {
            totalWordcount: totalWordcount,
            since: earliestSession ? earliestSession.start : null,
            largestProject: largestProject,
            highestWpm: highestWpm.length > 0 ? highestWpm[0] : null,
            period: performancePeriod.length > 0 ? performancePeriod[0] : null,
            session: performanceSession.length > 0 ? performanceSession[0] : null,
            bestDate: bestDate
          },
          avgs: {
            avgPerProject: projectAvg && projectAvg.wordcountAverage ? projectAvg.wordcountAverage : 0,
            avgPerMinute: performanceAvg.length > 0 && performanceAvg[0].wpmAverage ? performanceAvg[0].wpmAverage : 0,
            avgPerDay: dailyAvg.length > 0 && dailyAvg[0].dailyAverage ? dailyAvg[0].dailyAverage : 0,
            modePeriod: modePeriod.length > 0 ? modePeriod[0] : null,
            modeSession: modeSession.length > 0 ? modeSession[0] : null,
            modeProject: modeProject
          }
        });
      };
  promise.join(getTotalWordcount(), getEarliestSession(), getLargestProject(), getPerformancePeriod(),
               getPerformanceSession(), getHighestWpm(), getBestDate(), getProjectAvg(), getPerformanceAvg(),
               getDailyAverage(), getModePeriod(), getModeSession(), getModeProject(), renderer)
  .catch(next);
});

router.get('/yearlysessions.json', isactivated, function (req, res) {
  models.Session.findAll({
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
    })
    .then(function (yearSessions) {
      var yearly = [],
        dailySessions = [],
        zoneOffset = req.query.zoneOffset || 0,
        yearAgo = moment.utc().subtract(1, 'year').subtract(zoneOffset),
        today = moment.utc().subtract(zoneOffset),
        range = moment(yearAgo),
        i = 0;

      _.forEach(yearSessions, function (session) {
        var day = moment.utc(session.day).subtract(session.zoneOffset, 'minutes');
        dailySessions.push({
          x: day.valueOf(),
          y: day.day(),
          value: session.dailyCount
        });
      });

      while (today.diff(range) >= 0) {
        if (!dailySessions[i] || !range.isSame(dailySessions[i].x, 'day')) {
          yearly.push({
            x: range.valueOf(),
            y: range.day(),
            value: 0,
            color: '#EDEDED'
          });
        } else {
          if (dailySessions[i]) {
            yearly.push(dailySessions[i]);
          }
          i++;
        }
        range.add(1, 'day');
      }

      yearly = _.sortBy(yearly, 'x');

      res.json(yearly);
    }).catch(function (err) {
      console.log(err);
      res.status(500).json({
        error: 'Database error'
      });
    });
});

router.get('/perperiod.json', isactivated, function (req, res) {
  var perfs = null;
  models.sequelize.query("SELECT * FROM periodPerformance WHERE ownerId = " + req.user.id + " ORDER BY period ASC;", null, { raw: true })
  .then(function (periods) {
    perfs = periods;

    return models.sequelize.query('SELECT * FROM periods ORDER BY start ASC;', null, { raw: true });
  }).then(function (periods) {
    var result = {
      period: [],
      performance: [],
      realPerformance: [],
      totalWordcount: []
    };

    _.forEach(periods, function (period) {
      console.log(period);
      var entry = _.findWhere(perfs, { period: period.name}),
          start = moment.utc(period.start, 'hh:mm:ss').format(req.user.settings.timeFormat),
          end = moment.utc(period.end, 'hh:mm:ss').format(req.user.settings.timeFormat);

      result.period.push(titleCase(period.name) + '!' + start + '!' + end);
      result.performance.push(entry ? entry.performance : 0);
      result.realPerformance.push(entry ? entry.realPerformance : 0);
      result.totalWordcount.push(entry ? entry.totalWordcount : 0);
    });

    res.json(result);

  }).catch(function (err) {
    console.log(err);
    res.status(500);
    res.json({
      error: 'There was a server error;'
    });
  });
});

router.get('/persession.json', isactivated, function (req, res) {
  models.sequelize.query("SELECT SUM(`totalSessions`) AS `totalSessions`, SUM(`totalWordcount`) AS `totalWordcount`, (ROUND(`minuteDuration` / 5) * 5) AS `aproxTime`, `direction`, AVG(`minuteDuration`) AS `averageDuration`, AVG(`performance`) AS `averagePerformance`, AVG(`realPerformance`) AS `averageRealPerformance` FROM `sessionPerformance` WHERE `ownerId`= " + req.user.id + " GROUP BY round(`minuteDuration` / 5), `direction` ORDER BY `aproxTime`ASC, `direction` ASC;", null, { raw: true })
    .then(function (sessions) {
    var result = {
      duration: _.map(_.uniq(sessions, true, 'aproxTime'), 'aproxTime'),
      countdownWordcount: [],
      forwardWordcount: [],
      countdownPerformance: [],
      countdownRealPerformance: [],
      forwardPerformance: [],
      forwardRealPerformance: []
    };

    _.forEach(sessions, function (session) {
      if (session.direction === 'countdown') {
        while (result.countdownWordcount.length < result.duration.indexOf(session.aproxTime)) {
          result.countdownWordcount.push(0);
          result.countdownPerformance.push(0);
          result.countdownRealPerformance.push(0);
        }
        result.countdownWordcount.push(session.totalWordcount);
        result.countdownPerformance.push(session.averagePerformance);
        result.countdownRealPerformance.push(session.averageRealPerformance);
      } else {
        while (result.forwardWordcount.length < result.duration.indexOf(session.aproxTime)) {
          result.forwardWordcount.push(0);
          result.forwardPerformance.push(0);
          result.forwardRealPerformance.push(0);
        }
        result.forwardWordcount.push(session.totalWordcount);
        result.forwardPerformance.push(session.averagePerformance);
        result.forwardRealPerformance.push(session.averageRealPerformance);
      }
    });

    res.json(result);

  }).catch(function (err) {
    console.log(err);
    res.status(500);
    res.json({
      error: 'There was a server error;'
    });
  });
});

router.get('/periodsessionsdist.json', isactivated, function (req, res) {
  models.sequelize.query("SELECT * FROM periodPerformance WHERE ownerId = " + req.user.id + " ORDER BY period ASC", null, { raw: true })
  .then(function (periods) {
    var result = {};

    _.forEach(periods, function (period) {
      result[titleCase(period.period)] = period.totalSessions;
    });

    res.json(result);
  }).catch(function (err) {
    console.log(err);
    res.json({
      error: 'Internal server error'
    });
  });
});

router.get('/periodwordsdist.json', isactivated, function (req, res) {
  models.sequelize.query("SELECT * FROM periodPerformance WHERE ownerId = " + req.user.id + " ORDER BY period ASC", null, { raw: true })
  .then(function (periods) {
    var result = {};

    _.forEach(periods, function (period) {
      result[titleCase(period.period)] = period.totalWordcount;
    });

    res.json(result);
  }).catch(function (err) {
    console.log(err);
    res.json({
      error: 'Internal server error'
    });
  });
});

router.get('/durationsessionsdist.json', isactivated, function (req, res) {
  models.sequelize.query("SELECT SUM(`totalSessions`) AS `totalSessions`, SUM(`totalWordcount`) AS `totalWordcount`, (ROUND(`minuteDuration` / 5) * 5) AS `aproxTime`, `direction`, AVG(`minuteDuration`) AS `averageDuration`, AVG(`performance`) AS `averagePerformance`, AVG(`realPerformance`) AS `averageRealPerformance` FROM `sessionPerformance` WHERE `ownerId`= " + req.user.id + " GROUP BY round(`minuteDuration` / 5) ORDER BY `aproxTime`ASC, `direction` ASC;", null, { raw: true })
    .then(function (sessions) {
    var result = {
    };

    _.forEach(sessions, function (session) {
      result['~' + session.aproxTime + 'min'] = session.totalSessions;
    });

    res.json(result);

  }).catch(function (err) {
    console.log(err);
    res.status(500);
    res.json({
      error: 'There was a server error;'
    });
  });
});

router.get('/durationwordsdist.json', isactivated, function (req, res) {
  models.sequelize.query("SELECT SUM(`totalSessions`) AS `totalSessions`, SUM(`totalWordcount`) AS `totalWordcount`, (ROUND(`minuteDuration` / 5) * 5) AS `aproxTime`, `direction`, AVG(`minuteDuration`) AS `averageDuration`, AVG(`performance`) AS `averagePerformance`, AVG(`realPerformance`) AS `averageRealPerformance` FROM `sessionPerformance` WHERE `ownerId`= " + req.user.id + " GROUP BY round(`minuteDuration` / 5) ORDER BY `aproxTime`ASC, `direction` ASC;", null, { raw: true })
    .then(function (sessions) {
    var result = {
    };

    _.forEach(sessions, function (session) {
      result['~' + session.aproxTime + 'min'] = session.totalWordcount;
    });

    res.json(result);

  }).catch(function (err) {
    console.log(err);
    res.status(500);
    res.json({
      error: 'There was a server error;'
    });
  });
});

module.exports = router;
