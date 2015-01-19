var router = require('express').Router(),
  moment = require('moment'),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  chunk = require('../../utils/functions/chunk'),
  filterIds = require('../../utils/functions/filterids');

router.get('/targets', sendflash, function (req, res, next) {
  models.Target.findAndCountAll({
    where: {
      owner_id: req.user.id
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
      owner_id: req.user.id,
      active: true
    },
    order: [
      ['name', 'ASC']
    ]
  }).then(function (projects) {
    res.render('user/targets/single', {
      title: req.__('New target'),
      edit: false,
      target: {
        wordcount: 50000,
        start: moment().add(1, 'day').format('YYYY-MM-DD'),
        end: moment().add(31, 'days').format('YYYY-MM-DD')
      },
      projects: chunk(projects, 3)
    });
  }).catch(function (err) {
    next(err);
  });
});

router.post('/targets/new', function (req, res, next) {
  var start = moment(req.body.start, 'YYYY-MM-DD'),
      end =  moment(req.body.end, 'YYYY-MM-DD');

  start = start.isValid() ? start.toDate() : null;
  end = end.isValid() ? end.toDate() : null;

  models.Target.create({
    name: req.body.name,
    start: start,
    end: end,
    wordcount: req.body.wordcount,
    notes: req.body.notes,
    owner_id: req.user.id
  }).then(function (target) {
    return models.Project.findAll({
      where: {
        owner_id: req.user.id,
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
        owner_id: req.user.id,
        active: true
      },
      order: [
        ['name', 'ASC']
      ]
    }).then(function (projects) {
      res.render('user/targets/single', {
        title: req.__('New target'),
        edit: false,
        target: {
          name: req.body.name,
          start: req.body.start,
          end: req.body.end,
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
      owner_id: req.user.id
    },
    include: [{
      model: models.Project,
      as: 'Projects'
    }]
  }).then(function (target) {
    if (!target) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    return models.Project.findAll({
      where: {
        owner_id: req.user.id,
        active: true
      },
      order: [
        ['name', 'ASC']
      ]
    }).then(function (projects) {
      var data = target.dataValues;
      data.start = moment(data.start).format('YYYY-MM-DD');
      data.end = moment(data.end).format('YYYY-MM-DD');
      res.render('user/targets/single', {
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
      owner_id: req.user.id
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
      target.set('start', moment(req.body.start, 'YYYY-MM-DD'));
      target.set('end', moment(req.body.end, 'YYYY-MM-DD'));
      return target.save().then(function () {
        return models.Project.findAll({
          where: {
            owner_id: req.user.id,
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
        owner_id: req.user.id,
        active: true
      },
      order: [
        ['name', 'ASC']
      ]
    }).then(function (projects) {
      res.render('user/targets/single', {
        title: req.__('Edit target'),
        section: 'targetedit',
        edit: true,
        target: {
          name: req.body.name,
          notes: req.body.notes,
          wordcount: req.body.wordcount,
          start: req.body.start,
          end: !!req.body.end,
          Projects: filterIds(projects, req.body.projects)
        },
        projects: chunk(projects, 3),
        validate: err.errors,
        errorMessage: req.__('There are invalid values')
      });
    });
  });
});

module.exports = router;