var router = require('express').Router(),
  moment = require('moment'),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash');

function durationParser(dur) {
  var parts = dur.split(':', 2),
    min = parts[0] ? parseInt(parts[0], 10) : 0,
    sec = parts[1] ? parseInt(parts[1], 10) : 0;
  return (min * 60) + sec;
}

function durationFormatter(dur) {
  var min = Math.floor(dur / 60),
    sec = dur - min * 60;
  
  return (min.toString() +  ':' + (sec < 10 ? '0' + sec : sec));
}

function durationFormatterAlt(dur) {
  var min = Math.floor(dur / 60),
    sec = dur - min * 60;
  
  return (min.toString() +  'm' + (sec < 10 ? '0' + sec : sec)) + 's';
}

router.get('/sessions', sendflash, function (req, res, next) {
  var whereOpt = { ownerId: req.user.id };
  if (req.query.projectid) {
    whereOpt.id = req.query.projectid;
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
      currentPage: req.query.page
    });
  }).catch(function (err) {
    return next(err);
  });
});

router.get('/sessions/new', sendflash, function (req, res) {
  models.Project.findAll({
    where: {
      ownerId: req.user.id
    },
    order: [['name', 'ASC']]
  }).then(function (projects) {
    res.render('user/sessions/edit', {
      title: req.__('New session'),
      section: 'sessionnew',
      edit: false,
      session: {
        start: moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm'),
        wordcount: 0,
        duration: '15:00',
        pausedTime: '0:00',
        'project.id': req.query.projectid || 0
      },
      projects: projects
    });
  });
});

router.post('/sessions/new', function (req, res, next) {
  models.Session.create({
    summary: req.body.summary || null,
    notes: req.body.notes,
    wordcount: req.body.wordcount,
    start: moment(req.body.start, 'YYYY-MM-DD HH:mm').toDate(),
    duration: durationParser(req.body.duration),
    pausedTime: durationParser(req.body.pausedTime),
    isCountdown: !!req.body.isCountdown,
    projectId: req.body.project
  }).then(function () {      
    req.flash('success', req.__('Session "%s" successfully created',
                                req.body.summary.length > 0 ? req.body.summary : req.body.start));
    if (req.body.create) { return res.redirect('/sessions'); }
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
      res.render('user/sessions/edit', {
        title: req.__('New sessions'),
        section: 'sessionnew',
        edit: false,
        session: {
          summary: req.body.summary,
          notes: req.body.notes,
          wordcount: req.body.wordcount,
          start: req.body.start,
          pausedTime: req.body.pausedTime,
          duration: req.body.duration,
          isCountdown: !!req.body.isCountdown,
          'project.id': req.body.project
        },
        projects: projects,
        validate: err.errors,
        errorMessage: req.__('There are invalid values')
      });
    });
  });
});

router.get('/sessions/:id/edit', sendflash, function (req, res, next) {
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
      session.start = moment(session.start).format('YYYY-MM-DD HH:mm');
      session.duration = durationFormatter(session.duration);
      session.pausedTime = durationFormatter(session.pausedTime);
      res.render('user/sessions/edit', {
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

router.post('/sessions/:id/edit', function (req, res, next) {
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
      session.set('summary', req.body.summary);
      session.set('notes', req.body.notes);
      session.set('wordcount', req.body.wordcount);
      session.set('start', moment(req.body.start, 'YYYY-MM-DD HH:mm').toDate());
      session.set('duration', durationParser(req.body.duration));
      session.set('pausedTime', durationParser(req.body.pausedTime));
      session.set('isCountdown', !!req.body.isCountdown);
      session.set('projectId', parseInt(req.body.project, 10));
      return session.save();
    }
    return session.destroy();
  }).then(function () {
    var msg = (!!req.body.save) ? 'Session "%s" successfully saved.' : 'Session "%s" successfully deleted.';
    req.flash('success', req.__(msg, req.body.summary.length > 0 ? req.body.summary : req.body.start));
    if (!!req.body.save) {
      res.redirect('back');
    } else {
      res.redirect('/sessions');
    }
  }).catch(function (err) {
    if (err.message !== 'Validation error') { return next(err); }
    models.Project.findAll({
      where: {
        ownerId: req.user.id
      },
      order: [
        ['name', 'ASC']
      ]
    }, {
      raw: true
    }).then(function (projects) {
      res.render('user/sessions/edit', {
        title: req.__('Edit session'),
        section: 'projectedit',
        edit: true,
        session: {
          summary: req.body.summary,
          notes: req.body.notes,
          wordcount: req.body.wordcount,
          start: req.body.start,
          duration: req.body.duration,
          pausedTime: req.body.pausedTime,
          isCountdown: !!req.body.isCountdown,
          'project.id': req.body.project
        },
        projects: projects,
        validate: err.errors,
        errorMessage: req.__('There are invalid values')
      });
    });
  });
});

router.get('/sessions/:id', sendflash, function (req, res, next) {
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
    res.render('user/sessions/single', {
      title: 'View session',
      section: 'sessionsingle',
      session: session,
      durFormat: durationFormatterAlt
    });
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;