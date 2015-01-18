var _ = require('lodash'),
 models = require('../../models'),
  isactivated = require('../../utils/middlewares/isactivated'),
  sendflash = require('../../utils/middlewares/sendflash');

// Chunks the array in parts of len length
function chunk(arr, len) {
  var result = [],
    i = 0,
    n = arr.length;

  while (i < n) {
    result.push(arr.slice(i, i + len));
    i += len;
  }

  return result;
}

module.exports = function projectsRoutes(router) {
  router.get('/projects', sendflash, function (req, res, next) {
    models.Project.findAndCountAll({
      where: {
        owner_id: req.user.id
      },
      order: [['name', 'ASC']],
      limit: req.query.limit,
      offset: (parseInt(req.query.page, 10) - 1) * parseInt(req.query.limit, 10)
    }).then(function (result) {
      var projects = result.rows,
        count = result.count;
      res.render('user/projects/list', {
        title: req.__('Projects'),
        section: 'projects',
        projects: projects,
        pageCount: Math.ceil(count / parseInt(req.query.limit, 10)),
        currentPage: req.query.page
      });
    }).catch(function (err) {
      return next(err);
    });
  });
  
  router.get('/project/new', sendflash, function (req, res) {
    res.render('user/projects/single', {
      title: req.__('New project'),
      section: 'projectnew',
      edit: false,
      action: '/project/new',
      project: {
        active: true
      }
    });
  });
  
  router.post('/project/new', function (req, res, next) {
    models.Project.create({
      name: req.body.name,
      description: req.body.description,
      active: !!req.body.active,
      finished: !!req.body.finished,
      owner_id: req.user.id
    }).then(function () {
      req.flash('success', req.__('Project "%s" successfully created', req.body.name));
      if (req.body.create) { return res.redirect('/projects'); }
      res.redirect('/project/new');
    }).catch(function (err) {
      console.log('------err', err);
      if (err.message !== 'Validation error') { return next(err); }
      res.render('user/projects/single', {
        title: req.__('New project'),
        section: 'projectnew',
        edit: false,
        action: '/project/new',
        project: {
          name: req.body.name,
          description: req.body.description,
          active: !!req.body.active,
          finished: !!req.body.finished
        },
        validate: err.errors,
        errorMessage: req.__('There are invalid values')
      });
    });
  });
  
  router.get('/project/:id', sendflash, function (req, res, next) {
    req.user.getProjects({
      where: {
        id: req.params.id
      }
    }).complete(function (err, projects) {
      if (err) { return next(err); }
      if (projects.length !== 1) {
        var error = new Error('Not found');
        error.status = 404;
        return next(error);
      }
      res.render('user/projects/single', {
        title: req.__('Project edit'),
        section: 'projectedit',
        project: projects[0],
        edit: true
      });

    });
  });

  router.post('/project/:id', function (req, res, next) {
    req.user.getProjects({
      where: {
        id: req.params.id
      }
    }).then(function (projects) {
      if (projects.length !== 1) {
        var error = new Error('Not found');
        error.status = 404;
        return next(error);
      }
      if (!req.body.delete) {
        projects[0].set('name', req.body.name);
        projects[0].set('description', req.body.description);
        projects[0].set('active', !!req.body.active);
        projects[0].set('finished', !!req.body.finished);
        return projects[0].save();
      }
      return projects[0].destroy();
    }).then(function () {
      var msg = (!!req.body.save) ? req.__('Project %s successfully saved.') : req.__('Project %s successfully deleted.');
      req.flash('success', req.__(msg, req.body.name));
      if (!!req.body.save) {
        res.redirect('back');
      } else {
        res.redirect('/projects');
      }
    }).catch(function (err) {
      if (err.message !== 'Validation error') { return next(err); }
      res.render('user/projects/single', {
        title: req.__('Edit project'),
        section: 'projectedit',
        edit: true,
        action: '/project/new',
        project: {
          name: req.body.name,
          description: req.body.description,
          active: !!req.body.active,
          finished: !!req.body.finished
        },
        validate: err.errors,
        errorMessage: req.__('There are invalid values')
      });
    });
  });
};