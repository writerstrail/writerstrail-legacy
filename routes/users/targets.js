var router = require('express').Router(),
  _ = require('lodash'),
  moment = require('moment'),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  chunk = require('../../utils/functions/chunk'),
  filterIds = require('../../utils/functions/filterids');

router.get('/targets', sendflash, function (req, res, next) {
  models.Target.findAndCountAll({
    where: {
      ownerId: req.user.id
    },
    order: [['name', 'ASC']],
    limit: req.query.limit,
    offset: (parseInt(req.query.page, 10) - 1) * parseInt(req.query.limit, 10)
  }).then(function (result) {
    var targets = result.rows,
      count = result.count;
    res.render('user/targets/list', {
      title: req.__('Targets'),
      section: 'targets',
      targets: targets,
      pageCount: Math.ceil(count / parseInt(req.query.limit, 10)),
      currentPage: req.query.page
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/targets/new', sendflash, function (req, res, next) {
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
        end: moment.utc().add(30, 'days').format(req.user.settings.dateFormat)
      },
      projects: chunk(projects, 3)
    });
  }).catch(function (err) {
    next(err);
  });
});

router.post('/targets/new', function (req, res, next) {
  var start = moment.utc(req.body.start, req.user.settings.dateFormat),
      end =  moment.utc(req.body.end, req.user.settings.dateFormat);

  start = start.isValid() ? start.toDate() : null;
  end = end.isValid() ? end.toDate() : null;

  models.Target.create({
    name: req.body.name,
    start: start,
    end: end,
    wordcount: req.body.wordcount,
    notes: req.body.notes,
    ownerId: req.user.id,
    zoneOffset: req.body.zoneOffset || null,
  }).then(function (target) {
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
    if (req.body.create) { return res.redirect('/targets'); }
    res.redirect('/targets/new');
  }).catch(function (err) {
    console.log('----err', err);
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
          start: req.body.start,
          end: req.body.end,
          zoneOffset: req.body.zoneOffset || null,
          wordcount: req.body.wordcount,
          notes: req.body.notes,
          Projects: filterIds(projects, req.body.projects)
        },
        validate: err.errors,
        errorMessage: req.__('There are invalid values'),
        projects: chunk(projects, 3)
      });
    });
  });
});

router.get('/targets/:id/edit', sendflash, function (req, res, next) {
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
      where: {
        ownerId: req.user.id,
        active: true
      },
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

router.post('/targets/:id/edit', function (req, res, next) {
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
      target.set('name', req.body.name);
      target.set('notes', req.body.notes);
      target.set('wordcount', req.body.wordcount);
      target.set('start', moment.utc(req.body.start, req.user.settings.dateFormat));
      target.set('end', moment.utc(req.body.end, req.user.settings.dateFormat));
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
      res.redirect('back');
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
          wordcount: req.body.wordcount,
          start: req.body.start,
          end: req.body.end,
          projects: filterIds(projects, req.body.projects)
        },
        projects: chunk(projects, 3),
        validate: err.errors,
        errorMessage: req.__('There are invalid values')
      });
    });
  });
});

router.get('/targets/:id', sendflash, function (req, res, next) {
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
          }
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
      title: 'Target ' + target.name,
      section: 'targetsingle',
      target: target
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/targets/:id/data.json', function (req, res) {
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
          }
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
      var today = moment.utc(target.start).add(i - 1, 'days').format('YYYY-MM-DD');
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
      wordcount.push(accWc);
      var incTarget = Math.floor(target.wordcount / totalDays) + (target.wordcount % totalDays < i ? 0 : 1);
      dailytarget.push(incTarget);
      accTgt += incTarget;
      targetAcc.push(accTgt);
      remaining.push(Math.max(0, target.wordcount - accWc));
    }
    
    var result = {
      date: daysRange,
      wordcount: wordcount,
      target: targetAcc,
      daily: daily,
      dailytarget: dailytarget,
      ponddailytarget: pondDailyTarget,
      remaining: remaining
    };
    res.json(result).end();
  });
});

module.exports = router;
