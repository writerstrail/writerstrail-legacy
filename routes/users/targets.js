var router = require('express').Router(),
  qs = require('querystring'),
  _ = require('lodash'),
  moment = require('moment'),
  promise = require('sequelize').Promise,
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  isverified = require('../../utils/middlewares/isverified'),
  isactivated = require('../../utils/middlewares/isactivated'),
  chunk = require('../../utils/functions/chunk'),
  filterIds = require('../../utils/functions/filterids'),
  numerictrim = require('../../utils/functions/numerictrim'),
  serverExport = require('../../utils/chart-export/server-export'),
  targetunits = {
    word: 'words',
    char: 'characters'
  },
  anon = require('../../utils/data/anonuser');

function filterQuery(query) {
  var result = {};
  [
    'target',
    'dailytarget',
    'adjusteddailytarget',
    'remaining',
    'count',
    'daily'
  ].forEach(function (item) {
      ['word', 'char'].forEach(function (unit) {
        if (query[unit + item]) {
          result[unit + item] = query[unit + item] === 'true';
        }
      });
    });
  return result;
}

function chartData(req, callback) {
  var user = req.user || anon;

  models.Target.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {
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
                models.Sequelize.literal('`Target`.`end` + INTERVAL 1 DAY - INTERVAL 1 SECOND')
              ]
            },
            deletedAt: null
          },
          order: [['start', 'DESC']]
        }]
      },
      {
        model: models.User,
        as: 'owner',
        required: true,
        include: [{
          model: models.Settings,
          as: 'settings',
          required: true
        }]
      }
    ]
  }).then(function (target) {
    var accessible = false;

    if (target && (target.ownerId === user.id || target.public)) {
      accessible = true;
    }

    if (!accessible) {
      var err = new Error('Not Found');
      err.code = 404;
      return callback(err, {error: err.message});
    }

    var allSessions = _.reduce(target.projects, function (acc, project) {
      _.forEach(project.sessions, function (sess) {
        acc.push(sess);
      });
      return acc;
    }, []);

    var totalDays = Math.floor(moment.utc(target.end).diff(moment.utc(target.start), 'days', true)) + 1;
    var daysRange = [];
    var daily = [];
    var count = [], accWc = 0;
    var targetAcc = [], accTgt = 0;
    var dailytarget = [];
    var pondDailyTarget = [];
    var remaining = [];

    var a = _.groupBy(allSessions, function (sess) { return moment.utc(sess.dataValues.start).format('YYYY-MM-DD'); });

    function groupDaySessions(wc, sess) {
      return wc + sess.dataValues[target.unit + 'count'];
    }

    for (var i = 1; i <= totalDays; i++) {
      var workingDate = moment.utc(target.start).add(i - 1, 'days');
      var today = workingDate.format('YYYY-MM-DD');
      var diffWc = target.count - accWc;
      var diffDays = totalDays - i + 1;
      var pondTarget = Math.floor(diffWc / diffDays) + (diffWc % diffDays < i ? 0 : 1);
      pondDailyTarget.push(Math.max(0, pondTarget));
      daysRange.push(today);
      if (a[today]) {
        var todayWc = _.reduce(a[today], groupDaySessions, 0);
        accWc += todayWc;
        daily.push(todayWc);
      } else {
        daily.push(0);
      }
      if (moment.utc().subtract(target.zoneOffset || 0, 'minutes').diff(workingDate) > 0) {
        count.push(accWc);
      } else {
        count.push(null);
      }
      var incTarget = Math.floor(target.count / totalDays) + (target.count % totalDays < i ? 0 : 1);
      dailytarget.push(incTarget);
      accTgt += incTarget;
      targetAcc.push(accTgt);
      remaining.push(Math.max(0, target.count - accWc));
    }

    var result = {
      date: daysRange
    };
    result[target.unit + 'count'] = count;
    result[target.unit + 'daily'] = daily;

    if (target.count !== null) {
      result[target.unit + 'target'] = targetAcc;
      result[target.unit + 'dailytarget'] = dailytarget;
      result[target.unit + 'adjusteddailytarget'] = pondDailyTarget;
      result[target.unit + 'remaining'] = remaining;
    }

    var query = filterQuery(req.query), visibility = {}, settings = target.owner.settings;
    visibility.wordcount = visibility.charcount = visibility.wordtarget = visibility.chartarget = settings.chartType === 'cumulative';
    visibility.worddaily = visibility.chardaily = visibility.worddailytarget = visibility.chardailytarget = !visibility.wordcount;
    visibility.wordadjusteddailytarget = visibility.charadjusteddailytarget = settings.showAdjusted;
    visibility.wordremaining = visibility.charremaining = settings.showRemaining;

    result.visibility = _.defaults(query, target.chartOptions, visibility);

    callback(null, result);
  }).catch(function (err) {
    err.code = 500;
    callback(err, {
      error: err.message
    });
  });
}

router.use('*', function (req, res, next) {
  res.locals.targetunits = targetunits;
  next();
});

router.get('/', isactivated, sendflash, function (req, res, next) {
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

router.get('/new', isactivated, sendflash, function (req, res, next) {
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
        count: 50000,
        unit: 'word',
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

router.post('/new', isactivated, isverified, function (req, res, next) {
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
      description: ''.trim.apply(req.body.description || '') || null,
      start: start,
      end: end,
      count: numerictrim(req.body.count) || null,
      unit: req.body.unit,
      notes: req.body.notes,
      ownerId: req.user.id,
      zoneOffset: req.body.zoneOffset || 0,
      public: !!req.body.public
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
          description: req.body.description,
          start: start ? req.body.start : '',
          end: end ? req.body.end : '',
          zoneOffset: req.body.zoneOffset || 0,
          count: req.body.count || null,
          unit: req.body.unit,
          notes: req.body.notes,
          public: !!req.body.public,
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

router.get('/embed/:id', function (req, res, next) {
  models.Target.findOne({
    where: {
      id: req.params.id,
      "public": true
    }
  }).then(function (target) {
    if (!target) {
      return next();
    }
    var query = filterQuery(req.query);

    res.render('user/embed', {
      title: 'Target ' + target.name,
      object: target,
      datalink: '/targets/' + target.id + '/data.json',
      objectlink: '/targets/' + target.id,
      query: qs.stringify(query)
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/:id/edit', isactivated, sendflash, function (req, res, next) {
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

router.post('/:id/edit', isactivated, isverified, function (req, res, next) {
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
      target.set('description', ''.trim.apply(req.body.description || '') || null);
      target.set('notes', req.body.notes);
      target.set('count', numerictrim(req.body.count) || null);
      target.set('unit', req.body.unit);
      target.set('start', start);
      target.set('end', end);
      target.set('public', !!req.body.public);
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
          description:  req.body.description,
          notes: req.body.notes,
          count: req.body.count || null,
          unit: req.body.unit,
          start: req.body.start,
          end: req.body.end,
          public: !!req.body.public,
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
  if (!req.user) {
    req.user = res.locals.user = anon;
  }
  models.Target.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {
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
                models.Sequelize.literal('`Target`.`end` + INTERVAL 1 DAY - INTERVAL 1 SECOND')
              ]
            },
            deletedAt: null
          },
          order: [['start', 'DESC']]
        }]
      },
      {
        model: models.User,
        as: 'owner',
        required: true,
        include: [{
          model: models.Settings,
          as: 'settings',
          required: true
        }]
      }
    ]
  }).then(function (target) {
    if (!target) {
      return isactivated(req, res, next);
    }

    if (!target.public && target.ownerId !== req.user.id) {
      return isactivated(req, res, next);
    }

    res.render('user/targets/single', {
      title: target.name + ' target',
      section: 'targetsingle',
      target: target,
      socialMeta: {
        title: target.name,
        description: target.description || 'A writing target in Writer\'s Trail.',
        image: '/targets/' + target.id + '/chart.png',
        type: 'target',
        url: '/targets/' + target.id
      }
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/:id/chart.png', serverExport.middleware('Target', chartData));

router.get('/:id/deleteImage', isactivated, serverExport.deleteImageMiddleware('Target'));

router.get('/:id/data.json', function (req, res) {
  chartData(req, function (err, data) {
    if (err) {
      console.log(err);
      res.status(err.code);
    }
    res.json(data).end();
  });
});

router.post('/:id/data.json', function (req, res) {
  if (!req.user) {
    return res.status(401).end();
  }
  var item, visibility, validItems = [];
  [
    'target',
    'dailytarget',
    'adjusteddailytarget',
    'remaining',
    'count',
    'daily'
  ].forEach(function (item) {
      validItems.push('word' + item);
      validItems.push('char' + item);
    });

  item = req.body.item;

  if (validItems.indexOf(item) < 0) {
    return res.status(400).end();
  }

  visibility = req.body.visibility !== 'false';



  models.sequelize.transaction(function () {
    return models.Target.findOne({
      where: {
        id: req.params.id,
        ownerId: req.user.id
      }
    }).then(function (target) {
      if (!target) {
        return res.status(404).end();
      }
      var options = target.chartOptions;
      options[item] = visibility;
      target.chartOptions = options;
      return target.save();
    });
  }).then(function () {
    return res.status(204).end();
  }).catch(function (err) {
    console.log(err);
    return res.status(500).end();
  });
});

module.exports = router;
