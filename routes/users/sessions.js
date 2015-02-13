var router = require('express').Router(),
  moment = require('moment'),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  isverified = require('../../utils/middlewares/isverified'),
  promise = require('sequelize').Promise,
  durationparser = require('../../utils/functions/durationparser'),
  durationformatter = require('../../utils/functions/durationformatter');

function durationformatterAlt(dur) {
  var min = Math.floor(dur / 60),
    sec = dur - min * 60;
  
  return (min.toString() +  'm' + (sec < 10 ? '0' + sec : sec)) + 's';
}

router.get('/', sendflash, function (req, res, next) {
  var whereOpt = { ownerId: req.user.id },
    filters = [];
  if (req.query.projectid) {
    whereOpt.id = req.query.projectid;
    filters.push('Filtering by sessions of project with id ' + req.query.projectid + '.');
  }
  models.Session.findAndCountAll({
    include: [
      {
        model: models.Project,
        as: 'project',
        where: whereOpt
      }
    ],
    order: [['start', 'DESC']],
    limit: req.query.limit,
    offset: (parseInt(req.query.page, 10) - 1) * parseInt(req.query.limit, 10)
  }, {
    raw: true
  }).then(function (result) {
    var sessions = result.rows,
      count = result.count;
    res.render('user/sessions/list', {
      title: req.__('Sessions'),
      section: 'sessions',
      sessions: sessions,
      pageCount: Math.ceil(count / parseInt(req.query.limit, 10)),
      currentPage: req.query.page,
      filters: filters
    });
  }).catch(function (err) {
    return next(err);
  });
});

router.get('/new', sendflash, function (req, res) {
  models.Project.findAll({
    where: [
      { ownerId: req.user.id },
      models.Sequelize.or(
        { active: true },
        { id: req.query.projectid || 0 }
      )
    ],
    order: [['name', 'ASC']]
  }).then(function (projects) {
    res.render('user/sessions/form', {
      title: req.__('New session'),
      section: 'sessionnew',
      edit: false,
      session: {
        wordcount: 0,
        duration: '15:00',
        pausedTime: '0:00',
        'project.id': req.query.projectid || 0
      },
      projects: projects,
      errorMessage: projects.length > 0 ? [] : ['No project to make a session for. <strong><a href="/projects/new" class="alert-link">Create a new one now</a></strong>.']
    });
  });
});

router.post('/new', isverified, function (req, res, next) {
  models.Project.findOne({
    where: {
      id: req.body.project,
      ownerId: req.user.id
    }
  }, {
    raw: true
  }).then(function (project) {
    if (!project) {
      var err = new Error('Validation error');
      err.errors = [{
        path: 'project',
        message: 'Not a valid project'
      }];
      return promise.reject(err);
    } else {
      return promise.resolve(project);
    }
  }).then(function (project) {
    return models.Session.create({
      summary: req.body.summary || null,
      notes: req.body.notes,
      wordcount: req.body.wordcount,
      start: moment.utc(req.body.start, req.user.settings.dateFormat + ' ' + req.user.settings.timeFormat).toDate(),
      zoneOffset: req.body.zoneOffset || 0,
      duration: durationparser(req.body.duration),
      pausedTime: durationparser(req.body.pausedTime),
      isCountdown: !!req.body.isCountdown,
      projectId: project.id
    });
  }).then(function (session) {      
    req.flash('success', req.__('Session "%s" successfully created',
                                  req.body.summary.length > 0 ? req.body.summary : req.body.start));
    if (!req.body.createadd) { return res.redirect('/sessions/' + session.id); }
    res.redirect('/sessions/new');
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
    }, {
      raw: true
    }).then(function (projects) {
      res.render('user/sessions/form', {
        title: req.__('New sessions'),
        section: 'sessionnew',
        edit: false,
        session: {
          summary: req.body.summary,
          zoneOffset: req.body.zoneOffset || 0,
          notes: req.body.notes,
          wordcount: req.body.wordcount,
          start: req.body.start,
          pausedTime: durationformatter(durationparser(req.body.pausedTime)),
          duration: durationformatter(durationparser(req.body.duration)),
          isCountdown: !!req.body.isCountdown,
          'project.id': req.body.project
        },
        projects: projects,
        validate: err.errors,
        errorMessage: projects.length > 0 ? [req.__('There are invalid values')] : ['No project to make a session for. <strong><a href="/projects/new" class="alert-link">Create a new one now</a></strong>.']
      });
    }).catch(function (err) {
      next(err);
    });
  });
});

router.get('/:id/edit', sendflash, function (req, res, next) {
  models.Session.findOne({
    where: {
      id: req.params.id,
    },
    include: [{
      model: models.Project,
      as: 'project',
      where: { ownerId: req.user.id }
    }]
  }, {
    raw: true
  }).then(function (session) {
    if (!session) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    models.Project.findAll({
      where: [
        { ownerId: req.user.id },
        models.Sequelize.or(
          { active: true },
          { id: session['project.id'] } 
        )
      ],
      order: [
        ['name', 'ASC']
      ]
    }, {
      raw: true
    }).then(function (projects) {
      session.start = moment.utc(session.start).format(req.user.settings.dateFormat + ' ' + req.user.settings.timeFormat);
      session.duration = durationformatter(session.duration);
      session.pausedTime = durationformatter(session.pausedTime);
      res.render('user/sessions/form', {
        title: req.__('Session edit'),
        section: 'sessionedit',
        session: session,
        projects: projects,
        edit: true
      });
    }).catch(function (err) {
      next(err);
    });
  });
});

router.post('/:id/edit', isverified, function (req, res, next) {
  models.Session.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {
        model: models.Project,
        as: 'project',
        where: {
          ownerId: req.user.id
        }
      }
    ]
  }).then(function (session) {
    if (!session) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    if (!req.body.delete) {
      var start = moment.utc(req.body.start, req.user.settings.dateFormat + ' ' + req.user.settings.timeFormat);
      if (!start.isValid()) {
        var err = new Error('Validation error');
        err.errors = [{
          path: 'start',
          message: 'The start date and time must be valid'
        }];
        return promise.reject(err);
      }
      return models.Project.findOne({
        where: {
          id: req.body.project,
          ownerId: req.user.id
        }
      }, {
        raw: true
      }).then(function (project) {
        if (!project) {
          var err = new Error('Validation error');
          err.errors = [{
            path: 'project',
            message: 'Not a valid project'
          }];
          return promise.reject(err);
        } else {
          return promise.resolve(project);
        }
      }).then(function () {
        session.set('summary', req.body.summary);
        session.set('notes', req.body.notes);
        session.set('wordcount', req.body.wordcount);
        session.set('start', start.toDate());
        session.set('duration', durationparser(req.body.duration));
        session.set('pausedTime', durationparser(req.body.pausedTime));
        session.set('isCountdown', !!req.body.isCountdown);
        session.set('projectId', parseInt(req.body.project, 10));
        session.set('zoneOffset', session.zoneOffset || (req.body.zoneOffset || 0));
        return session.save();
      });
    }
    return session.destroy();
  }).then(function (session) {
    var msg = (!!req.body.save) ? 'Session "%s" successfully saved.' : 'Session "%s" successfully deleted.';
    req.flash('success', req.__(msg, req.body.summary.length > 0 ? req.body.summary : req.body.start));
    if (!!req.body.save) {
      res.redirect('/sessions/' + session.id);
    } else {
      res.redirect('/sessions');
    }
  }).catch(function (err) {
    if (err.message !== 'Validation error') { return next(err); }
    models.Project.findAll({
      where: [
        { ownerId: req.user.id },
        models.Sequelize.or(
          { active: true },
          { id: req.body.project } 
        )
      ],
      order: [
        ['name', 'ASC']
      ]
    }, {
      raw: true
    }).then(function (projects) {
      res.render('user/sessions/form', {
        title: req.__('Edit session'),
        section: 'projectedit',
        edit: true,
        session: {
          id: req.params.id,
          summary: req.body.summary,
          notes: req.body.notes,
          wordcount: req.body.wordcount,
          start: req.body.start,
          duration: durationformatter(durationparser(req.body.duration)),
          pausedTime: durationformatter(durationparser(req.body.pausedTime)),
          isCountdown: !!req.body.isCountdown,
          'project.id': req.body.project
        },
        projects: projects,
        validate: err.errors,
        errorMessage: [req.__('There are invalid values')]
      });
    }).catch(function (err) {
      next(err);
    });
  });
});

router.get('/:id', sendflash, function (req, res, next) {
  models.Session.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {
        model: models.Project,
        as: 'project',
        where: {
          ownerId: req.user.id
        },
        include: [
          {
            model: models.Target,
            as: 'targets',
            where: {        
              start: {
                lte: models.Sequelize.literal('`Session`.`start`'),
              },
              end: {
                gte: models.Sequelize.literal('(`Session`.`start` + INTERVAL `Session`.`duration` SECOND)'),
              }
            },
            required: false
          }
        ]
      }
    ]
  }).then(function (session) {
    if (!session) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    res.render('user/sessions/single', {
      title: 'Session for ' + session.project.name,
      section: 'sessionsingle',
      session: session,
      durFormat: durationformatterAlt
    });
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;