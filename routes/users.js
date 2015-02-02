var router = require('express').Router(),
  promise = require('sequelize').Promise,
  _ = require('lodash'),
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

router.get('/dashboard', isactivated, sendflash, function (req, res, next) {
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
      return models.sequelize.query("SELECT * FROM periodPerformance WHERE ownerId = " + req.user.id + " LIMIT 1;");
    },
    getPerformanceSession = function () {
      return models.sequelize.query("SELECT * FROM sessionPerformance WHERE ownerId = " + req.user.id + " LIMIT 1;");
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
        durationFormatter: durationFormatterAlt
      });
    };
  promise.join(getProjects(), getTarget(), getTotalWordcount(), getDailyCounts(), getPerformancePeriod(), getPerformanceSession(), getLargestProject(), renderer)
  .catch(function (err) {
    next(err);
  });
});

module.exports = router;