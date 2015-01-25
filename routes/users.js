var router = require('express').Router(),
  promise = require('sequelize').Promise,
  moment = require('moment'),
  genres = require('./users/genres'),
  projects = require('./users/projects'),
  targets = require('./users/targets'),
  sessions = require('./users/sessions'),
  settings = require('./users/settings'),
  isactivated = require('../utils/middlewares/isactivated'),
  models = require('../models');

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

router.get('/dashboard', function (req, res, next) {
  
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
        where: {
          ownerId: req.user.id,
          end: {
            gte: moment.utc().subtract(0, 'day').toDate(),
          }
        },
        order: [['end', 'ASC']]
      }, {
        raw: true
      });
    };
  promise.join(getProjects(), getTarget(), function (projects, target) {
    res.render('user/dashboard', {
      title: 'Dashboard',
      section: 'dashboard',
      projects: projects,
      target: target
    });
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;