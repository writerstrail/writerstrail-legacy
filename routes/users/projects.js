var models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  chunk = require('../../utils/functions/chunk'),
  filterIds = require('../../utils/functions/filterids');

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
  
  router.get('/projects/new', sendflash, function (req, res) {
    models.Genre.findAll({
      where: {
        owner_id: req.user.id
      },
      order: [
        ['name', 'ASC']
      ]
    }).then(function (genres) {
      res.render('user/projects/single', {
        title: req.__('New project'),
        section: 'projectnew',
        edit: false,
        project: {
          active: true,
          wordcount: 0,
          targetwc: 50000
        },
        genres: chunk(genres, 3)
      });
    });
  });
  
  router.post('/projects/new', function (req, res, next) {
    models.Project.create({
      name: req.body.name,
      description: req.body.description,
      wordcount: req.body.wordcount,
      targetwc: req.body.targetwc,
      active: !!req.body.active,
      finished: !!req.body.finished,
      owner_id: req.user.id
    }).then(function (project) {
      return models.Genre.findAll({
        where: {
          owner_id: req.user.id,
          id: {
            in: req.body.genres
          }
        }
      }).then(function (genres) {
        return project.setGenres(genres);
      });
    }).then(function () {      
      req.flash('success', req.__('Project "%s" successfully created', req.body.name));
      if (req.body.create) { return res.redirect('/projects'); }
      res.redirect('/projects/new');
    }).catch(function (err) {
      if (err.message !== 'Validation error') { return next(err); }
      models.Genre.findAll({
        where: {
          owner_id: req.user.id
        },
        order: [
          ['name', 'ASC']
        ]
      }).then(function (genres) {
        res.render('user/projects/single', {
          title: req.__('New project'),
          section: 'projectnew',
          edit: false,
          project: {
            name: req.body.name,
            description: req.body.description,
            wordcount: req.body.wordcount,
            targetwc: req.body.targetwc,
            active: !!req.body.active,
            finished: !!req.body.finished,
            Genres: filterIds(genres, req.body.genres)
          },
          genres: chunk(genres, 3),
          validate: err.errors,
          errorMessage: req.__('There are invalid values')
        });
      });
    });
  });
  
  router.get('/projects/:id', sendflash, function (req, res, next) {
    models.Project.findOne({
      where: {
        id: req.params.id,
        owner_id: req.user.id
      },
      include: [{
        model: models.Genre,
        as: 'Genres'
      }]
    }).complete(function (err, project) {
      if (err) { return next(err); }
      if (!project) {
        var error = new Error('Not found');
        error.status = 404;
        return next(error);
      }
      models.Genre.findAll({
        where: {
          owner_id: req.user.id
        },
        order: [
          ['name', 'ASC']
        ]
      }).then(function (genres) {
        res.render('user/projects/single', {
          title: req.__('Project edit'),
          section: 'projectedit',
          project: project,
          genres: chunk(genres, 3),
          edit: true
        });
      }).catch(function (err) {
        next(err);
      });
    });
  });

  router.post('/projects/:id', function (req, res, next) {
    models.Project.findOne({
      where: {
        id: req.params.id,
        owner_id: req.user.id
      }
    }).then(function (project) {
      if (!project) {
        var error = new Error('Not found');
        error.status = 404;
        return next(error);
      }
      if (!req.body.delete) {
        project.set('name', req.body.name);
        project.set('description', req.body.description);
        project.set('wordcount', req.body.wordcount);
        project.set('targetwc', req.body.targetwc);
        project.set('active', !!req.body.active);
        project.set('finished', !!req.body.finished);
        return project.save().then(function () {
          return models.Genre.findAll({
            where: {
              owner_id: req.user.id,
              id: {
                in: req.body.genres
              }
            }
          }).then(function (genres){
            return project.setGenres(genres);
          });
        });
      }
      return project.destroy();
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
      models.Genre.findAll({
        where: {
          owner_id: req.user.id
        },
        order: [
          ['name', 'ASC']
        ]
      }).then(function (genres) {
        res.render('user/projects/single', {
          title: req.__('Edit project'),
          section: 'projectedit',
          edit: true,
          project: {
            name: req.body.name,
            description: req.body.description,
            wordcount: req.body.wordcount,
            targetwc: req.body.targetwc,
            active: !!req.body.active,
            finished: !!req.body.finished,
            Genres: filterIds(genres, req.body.genres)
          },
          genres: chunk(genres, 3),
          validate: err.errors,
          errorMessage: req.__('There are invalid values')
        });
      });
    });
  });
};