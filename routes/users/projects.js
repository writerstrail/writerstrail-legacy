var router = require('express').Router(),
  moment = require('moment'),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  isverified = require('../../utils/middlewares/isverified'),
  chunk = require('../../utils/functions/chunk'),
  filterIds = require('../../utils/functions/filterids');

router.get('/', sendflash, function (req, res, next) {
  var filters = [],
    searchOpts = {
      where: {
        ownerId: req.user.id
      },
      order: [['name', 'ASC']],
      limit: req.query.limit,
      offset: (parseInt(req.query.page, 10) - 1) * parseInt(req.query.limit, 10)
    };
  
  if (req.query.genreid) {
    searchOpts.include = [
      {
        model: models.Genre,
        as: 'genres',
        where: {
          id: req.query.genreid
        }
      }
    ];
    filters.push('Filtering by projects that have genre with id ' + req.query.genreid + '.');
  }
  
  models.Project.findAndCountAll(searchOpts).then(function (result) {
    var projects = result.rows,
      count = result.count;
    res.render('user/projects/list', {
      title: req.__('Projects'),
      section: 'projects',
      projects: projects,
      pageCount: Math.ceil(count / parseInt(req.query.limit, 10)),
      currentPage: req.query.page,
      filters: filters
    });
  }).catch(function (err) {
    return next(err);
  });
});

router.get('/new', sendflash, function (req, res) {
  models.Genre.findAll({
    where: {
      ownerId: req.user.id
    },
    order: [
      ['name', 'ASC']
    ]
  }).then(function (genres) {
    res.render('user/projects/form', {
      title: req.__('New project'),
      section: 'projectnew',
      edit: false,
      project: {
        active: true,
        wordcount: 0,
        targetwc: 50000,
        genres: req.query.genreid ? [{id: req.query.genreid}] : []
      },
      genres: chunk(genres, 3)
    });
  });
});

router.post('/new', isverified, function (req, res, next) {
  var savedProject = {};
  models.Project.create({
    name: req.body.name,
    description: req.body.description,
    wordcount: req.body.wordcount,
    targetwc: req.body.targetwc,
    active: !!req.body.active,
    finished: !!req.body.finished,
    ownerId: req.user.id
  }).then(function (project) {
    savedProject = project;
    return models.Genre.findAll({
      where: {
        ownerId: req.user.id,
        id: {
          in: req.body.genres
        }
      }
    }).then(function (genres) {
      return project.setGenres(genres);
    });
  }).then(function () {      
    req.flash('success', req.__('Project "%s" successfully created', req.body.name));
    if (req.body.create) { return res.redirect('/projects/' + savedProject.id); }
    res.redirect('/projects/new');
  }).catch(function (err) {
    if (err.message !== 'Validation error') { return next(err); }
    models.Genre.findAll({
      where: {
        ownerId: req.user.id
      },
      order: [
        ['name', 'ASC']
      ]
    }).then(function (genres) {
      res.render('user/projects/form', {
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
          genres: filterIds(genres, req.body.genres)
        },
        genres: chunk(genres, 3),
        validate: err.errors,
        errorMessage: [req.__('There are invalid values')]
      });
    }).catch(function (err) {
      next(err);
    });
  });
});

router.get('/:id/edit', sendflash, function (req, res, next) {
  models.Project.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    },
    include: [{
      model: models.Genre,
      as: 'genres'
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
        ownerId: req.user.id
      },
      order: [
        ['name', 'ASC']
      ]
    }).then(function (genres) {
      res.render('user/projects/form', {
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

router.post('/:id/edit', isverified, function (req, res, next) {
  var savedProject = null;
  models.Project.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id
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
        savedProject = project;
        return models.Genre.findAll({
          where: {
            ownerId: req.user.id,
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
      res.redirect('/projects/' + savedProject.id);
    } else {
      res.redirect('/projects');
    }
  }).catch(function (err) {
    if (err.message !== 'Validation error') { return next(err); }
    models.Genre.findAll({
      where: {
        ownerId: req.user.id
      },
      order: [
        ['name', 'ASC']
      ]
    }).then(function (genres) {
      res.render('user/projects/form', {
        title: req.__('Edit project'),
        section: 'projectedit',
        edit: true,
        project: {
          id: req.params.id,
          name: req.body.name,
          description: req.body.description,
          wordcount: req.body.wordcount,
          targetwc: req.body.targetwc,
          active: !!req.body.active,
          finished: !!req.body.finished,
          genres: filterIds(genres, req.body.genres)
        },
        genres: chunk(genres, 3),
        validate: err.errors,
        errorMessage: [req.__('There are invalid values')]
      });
    }).catch(function (err) {
      next(err);
    });
  });
});

router.get('/active', sendflash, function (req, res, next) {
  models.Project.findAndCountAll({
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
    limit: req.query.limit,
    offset: (parseInt(req.query.page, 10) - 1) * parseInt(req.query.limit, 10),
    order: [
      [models.Sequelize.literal('`percentage`'), 'DESC'],
      ['name', 'ASC']
    ]
  }, {
    raw: true
  }).then(function (result) {
    var count = result.count,
      projects = result.rows;
    res.render('user/projects/active', {
      title: 'Active projects',
      section: 'projectsactive',
      projects: projects,
      pageCount: Math.ceil(count / parseInt(req.query.limit, 10)),
      currentPage: req.query.page
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/:id', sendflash, function (req, res, next) {
  models.Project.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    },
    include: [
      {
        model: models.Genre,
        as: 'genres',
        order: [['name', 'ASC']]
      },
      {
        model: models.Target,
        as: 'targets',
        order: [['name', 'ASC']]
      }
    ]
  }).then(function (project) {
    if (!project) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    
    res.render('user/projects/single', {
      title: project.name + ' project',
      section: 'projectsingle',
      project: project
    });
    
  }).catch(function (err) {
    next(err);
  });
});

router.get('/:id/data.json', function (req, res, next) {
  var daysToLook = 30;
  var start = moment.utc(req.query.start, 'YYYY-MM-DD').startOf('day');
  var end = moment.utc(req.query.end, 'YYYY-MM-DD').endOf('day');
  var hasStartQuery = true, hasEndQuery = true;
  
  if (!start.isValid() || start.isAfter(end)) {
    start = moment.utc().subtract(daysToLook - 1, 'days').subtract(req.query.zoneOffset || 0, 'minutes').startOf('day');
    hasStartQuery = false;
  }
  if (!end.isValid() || start.isAfter(end)) {
    end = moment.utc().subtract(req.query.zoneOffset || 0, 'minutes').endOf('day');
    hasEndQuery = false;
  }
  daysToLook = end.diff(start, 'days') + 1;
  
  models.Project.findAll({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    },
    include: [
      {
        model: models.Session,
        as: 'sessions',
        where: {
          start: {
            gte: start.toDate(),
            lte: end.toDate()
          }
        },
        attributes: [
          'start', models.Sequelize.literal('DATE(`sessions`.`start`) AS `date`'), models.Sequelize.literal('SUM(`sessions`.`wordcount`) AS `dailyCount`')
        ],
        required: true
      }
    ],
    order: [models.Sequelize.literal('`date` ASC')],
    group: [models.Sequelize.literal('DATE(`sessions`.`start`)')]
  }, {
    raw: true
  }).then(function (sessions) {
    
    var daysRange = [];
    var daily = [];
    var wordcount = [], accWc = 0;
    
    var j = 0;
    
    if (!hasStartQuery) {
      start.add(req.query.zoneOffset || 0, 'minutes');
    }
    if (!hasEndQuery) {
      end.add(req.query.zoneOffset || 0, 'minutes');
    }
        
    for (var i = 0; i < daysToLook; i++) {
      var workingDate = moment(start).add(i, 'days');
      var currentWc = 0;
      if (sessions[j] && moment.utc(sessions[j]['sessions.start']).diff(workingDate, 'days') === 0) {
        daily.push(sessions[j].dailyCount);
        accWc += sessions[j].dailyCount;
        currentWc = sessions[j].dailyCount;
        j++;
      } else {
        daily.push(0);
      }
      daysRange.push(workingDate.format('YYYY-MM-DD'));
      wordcount.push(accWc);
    }
    
    var result = {
      date: daysRange,
      wordcount: wordcount,
      daily: daily
    };
    res.json(result).end();
  }).catch(function (err) {
    if (process.env.NODE_ENV === 'development') {
      return next(err);
    }
    res.json({error: err});
  });
});

module.exports = router;