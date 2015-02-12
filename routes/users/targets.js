var router = require('express').Router(),
  _ = require('lodash'),
  moment = require('moment'),
  promise = require('sequelize').Promise,
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  isverified = require('../../utils/middlewares/isverified'),
  chunk = require('../../utils/functions/chunk'),
  filterIds = require('../../utils/functions/filterids');

router.get('/', sendflash, function (req, res, next) {
  var filters = [],
    config = {
      where: [
        { ownerId: req.user.id }
      ],
      order: [['name', 'ASC']],
      limit: req.query.limit,
      offset: (parseInt(req.query.page, 10) - 1) * parseInt(req.query.limit, 10)
    };
  if (req.query.current) {
    config.where.push(models.Sequelize.literal('`Target`.`start` <= (NOW() + INTERVAL 1 DAY + INTERVAL `Target`.`zoneOffset` MINUTE)'));
    config.where.push(models.Sequelize.literal('`Target`.`end` >= (NOW() - INTERVAL 1 DAY + INTERVAL `Target`.`zoneOffset` MINUTE)'));
    filters.push('Only current targets are shown.');
  }
  
  if (req.query.projectid) {
    config.include = [{
      model: models.Project,
      as: 'projects',
      where: {
        ownerId: req.user.id,
        id: req.query.projectid
      },
      required: true
    }];
    filters.push('Filtering by targets that contain project with id ' + req.query.projectid + '.');
  }
  
  models.Target.findAndCountAll(config).then(function (result) {
    var targets = result.rows,
      count = result.count;
    res.render('user/targets/list', {
      title: req.__('Targets'),
      section: 'targets',
      targets: targets,
      pageCount: Math.ceil(count / parseInt(req.query.limit, 10)),
      currentPage: req.query.page,
      filters: filters
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/new', sendflash, function (req, res, next) {
  models.Project.findAll({
    where: {
      ownerId: req.user.id,
      active: true
    },
    order: [
      ['name', 'ASC']
    ]
  }).then(function (projects) {
    res.render('user/targets/form', {
      title: req.__('New target'),
      edit: false,
      target: {
        wordcount: 50000,
        start: moment.utc().add(1, 'day').format(req.user.settings.dateFormat),
        end: moment.utc().add(30, 'days').format(req.user.settings.dateFormat),
        projects: [{ id: req.query.projectid }]
      },
      projects: chunk(projects, 3)
    });
  }).catch(function (err) {
    next(err);
  });
});

router.post('/new', isverified, function (req, res, next) {
  var savedTarget = {},
    start = moment.utc(req.body.start, req.user.settings.dateFormat),
    end =  moment.utc(req.body.end, req.user.settings.dateFormat);

  start = start.isValid() ? start.toDate() : null;
  end = end.isValid() ? end.toDate() : null;

  (function () {
    var err = null;
    if (start === null) {
      err = new Error('Validation error');
      err.errors = [{
        path: 'start',
        message: 'The start date must be valid'
      }];
    }
    if (end === null) {
      err = err || new Error('Validation error');
      err.errors = [{
        path: 'end',
        message: 'The end date must be valid'
      }].concat(err.errors || []);
    }
    if (err) {
      return promise.reject(err);
    }
    return promise.resolve([start, end]);
  })().spread(function (start, end) {
    return models.Target.create({
      name: req.body.name,
      start: start,
      end: end,
      wordcount: req.body.notarget ? null : (req.body.wordcount || 0),
      notes: req.body.notes,
      ownerId: req.user.id,
      zoneOffset: req.body.zoneOffset || 0,
    });
  }).then(function (target) {
    savedTarget = target;
    return models.Project.findAll({
      where: {
        ownerId: req.user.id,
        id: req.body.projects
      }
    }).then(function (projects) {
      return target.setProjects(projects);
    });
  }).then(function () {
    req.flash('success', req.__('The target "%s" was successfull created', req.body.name));
    if (req.body.create) { return res.redirect('/targets/' + savedTarget.id); }
    res.redirect('/targets/new');
  }).catch(function (err) {
    if (err.message !== 'Validation error') { return next(err); }
    models.Project.findAll({
      where: {
        ownerId: req.user.id,
        active: true
      },
      order: [
        ['name', 'ASC']
      ]
    }).then(function (projects) {
      res.render('user/targets/form', {
        title: req.__('New target'),
        edit: false,
        target: {
          name: req.body.name,
          start: start ? req.body.start : '',
          end: end ? req.body.end : '',
          zoneOffset: req.body.zoneOffset || 0,
          wordcount: req.body.notarget ? null : (req.body.wordcount || 0),
          notes: req.body.notes,
          projects: filterIds(projects, req.body.projects)
        },
        validate: err.errors,
        errorMessage: [req.__('There are invalid values')],
        projects: chunk(projects, 3)
      });
    }).catch(function (err) {
      next(err);
    });
  });
});

router.get('/:id/edit', sendflash, function (req, res, next) {
  models.Target.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    },
    include: [{
      model: models.Project,
      as: 'projects'
    }]
  }).then(function (target) {
    if (!target) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    return models.Project.findAll({
      where: [
        { ownerId: req.user.id },
        models.Sequelize.or(
          { active: true },
          { id: { in: _.pluck(target.projects, 'id')} }
        )
      ],
      order: [
        ['name', 'ASC']
      ]
    }).then(function (projects) {
      var data = target.dataValues;
      data.start = moment.utc(data.start).format(req.user.settings.dateFormat);
      data.end = moment.utc(data.end).format(req.user.settings.dateFormat);
      res.render('user/targets/form', {
        title: req.__('Target edit'),
        section: 'targetedit',
        target: target,
        projects: chunk(projects, 3),
        edit: true
      });
    });
  }).catch(function (err) {
    next(err);
  });
});

router.post('/:id/edit', isverified, function (req, res, next) {
  var savedTarget = {};
  models.Target.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    }
  }).then(function (target) {
    if (!target) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    if (!req.body.delete) {
      var start = moment.utc(req.body.start, req.user.settings.dateFormat),
        end =  moment.utc(req.body.end, req.user.settings.dateFormat);

      start = start.isValid() ? start.toDate() : null;
      end = end.isValid() ? end.toDate() : null;
      
      var err = null;
      if (start === null) {
        err = new Error('Validation error');
        err.errors = [{
          path: 'start',
          message: 'The start date must be valid'
        }];
      }
      if (end === null) {
        err = err || new Error('Validation error');
        err.errors = [{
          path: 'end',
          message: 'The end date must be valid'
        }].concat(err.errors || []);
      }
      if (err) {
        return promise.reject(err);
      }
      savedTarget = target;
      target.set('name', req.body.name);
      target.set('notes', req.body.notes);
      target.set('wordcount', req.body.notarget ? null : (req.body.wordcount || 0));
      target.set('start', start);
      target.set('end', end);
      target.set('zoneOffset', target.zoneOffset || (req.body.zoneOffset || 0));
      return target.save().then(function () {
        return models.Project.findAll({
          where: {
            ownerId: req.user.id,
            id: {
              in: req.body.projects
            }
          }
        }).then(function (projects){
          return target.setProjects(projects);
        });
      });
    }
    return target.destroy();
  }).then(function () {
    var msg = (!!req.body.save) ? req.__('Target "%s" successfully saved.') : req.__('Target "%s" successfully deleted.');
    req.flash('success', req.__(msg, req.body.name));
    if (!!req.body.save) {
      res.redirect('/targets/' + savedTarget.id);
    } else {
      res.redirect('/targets');
    }
  }).catch(function (err) {
    if (err.message !== 'Validation error') { return next(err); }
    models.Project.findAll({
      where: {
        ownerId: req.user.id,
        active: true
      },
      order: [
        ['name', 'ASC']
      ]
    }).then(function (projects) {
      res.render('user/targets/form', {
        title: req.__('Edit target'),
        section: 'targetedit',
        edit: true,
        target: {
          name: req.body.name,
          notes: req.body.notes,
          wordcount: req.body.notarget ? null : (req.body.wordcount || 0),
          start: req.body.start,
          end: req.body.end,
          projects: filterIds(projects, req.body.projects)
        },
        projects: chunk(projects, 3),
        validate: err.errors,
        errorMessage: [req.__('There are invalid values')]
      });
    }).catch(function (err) {
      next(err);
    });
  });
});

router.get('/:id', sendflash, function (req, res, next) {
  models.Target.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    },
    include: [{
      model: models.Project,
      as: 'projects',
      order: [['name', 'ASC']],
      include: [{
        model: models.Session,
        as: 'sessions',
        required: false,
        where: {
          start: {
            between: [
             models.Sequelize.literal('`Target`.`start`'),
             models.Sequelize.literal('`Target`.`end`')
            ]
          },
          deletedAt: null
        },
        order: [['start', 'DESC']]
      }]
    }]
  }).then(function (target) {
    if (!target) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    res.render('user/targets/single', {
      title: target.name + ' target',
      section: 'targetsingle',
      target: target
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/:id/data.json', function (req, res) {
  models.Target.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    },
    include: [{
      model: models.Project,
      as: 'projects',
      order: [['name', 'ASC']],
      include: [{
        model: models.Session,
        as: 'sessions',
        required: false,
        where: {
          start: {
            between: [
             models.Sequelize.literal('`Target`.`start`'),
             models.Sequelize.literal('`Target`.`end`')
            ]
          },
          deletedAt: null
        },
        order: [['start', 'DESC']]
      }]
    }]
  }).then(function (target) {
    res.type('application/json');
    if (!target) {
      return res.status(404).send('{"Error":"Not found"}').end();
    }
    var totalDays = Math.floor(moment.utc(target.end).diff(moment.utc(target.start), 'days', true)) + 1;
    var daysRange = [];
    var daily = [];
    var wordcount = [], accWc = 0;
    var targetAcc = [], accTgt = 0;
    var dailytarget = [];
    var pondDailyTarget = [];
    var remaining = [];
    
    var allSessions = _.reduce(target.projects, function (acc, project) { 
      _.forEach(project.sessions, function (sess) {
        acc.push(sess);
      });
      return acc;
    }, []);
    
    var a = _.groupBy(allSessions, function (sess) { return moment.utc(sess.dataValues.start).format('YYYY-MM-DD'); });
    
    for (var i = 1; i <= totalDays; i++) {
      var workingDate = moment.utc(target.start).add(i - 1, 'days');
      var today = workingDate.format('YYYY-MM-DD');
      var diffWc = target.wordcount - accWc;
      var diffDays = totalDays - i + 1;
      var pondTarget = Math.floor(diffWc / diffDays) + (diffWc % diffDays < i ? 0 : 1);
      pondDailyTarget.push(Math.max(0, pondTarget));
      daysRange.push(today);
      if (a[today]) {
        var todayWc = _.reduce(a[today], function (wc, sess) { return wc + sess.dataValues.wordcount; }, 0);
        accWc += todayWc;
        daily.push(todayWc);
      } else {
        daily.push(0);
      }
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
      daily: daily
    };
    if (target.wordcount !== null) {
      result.target = targetAcc;
      result.dailytarget = dailytarget;
      result.adjusteddailytarget = pondDailyTarget;
      result.remaining = remaining;
    }
    res.json(result).end();
  });
});

module.exports = router;