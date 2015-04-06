var router = require('express').Router(),
  path = require('path'),
  moment = require('moment'),
  _ = require('lodash'),
  env = process.env.NODE_ENV || 'development',
  config = require('../../config/config')[env],
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  isverified = require('../../utils/middlewares/isverified'),
  isactivated = require('../../utils/middlewares/isactivated'),
  chunk = require('../../utils/functions/chunk'),
  numerictrim = require('../../utils/functions/numerictrim'),
  filterIds = require('../../utils/functions/filterids'),
  serverExport = require('../../utils/chart-export/server-export'),
  anon = require('../../utils/data/anonuser');

function chartData(req, callback) {
  var user = req.user || anon;

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
      id: req.params.id
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
          'start', models.Sequelize.literal('DATE(`sessions`.`start`) AS `date`'),
          models.Sequelize.literal('SUM(`sessions`.`wordcount`) AS `dailyCount`'),
          models.Sequelize.literal('SUM(`sessions`.`charcount`) AS `dailyCharCount`')
        ],
        required: true
      }
    ],
    order: [models.Sequelize.literal('`date` ASC')],
    group: [models.Sequelize.literal('DATE(`sessions`.`start`)')]
  }, {
    raw: true
  }).then(function (sessions) {

    var accessible = false;

    if (sessions.length > 0 && (sessions[0].public > 0 || sessions[0].ownerId === user.id)) {
      accessible = true;
    }

    sessions = accessible ? sessions : [];

    var daysRange = [];
    var daily = [], dailyChar = [];
    var wordcount = [], accWc = 0;
    var charcount = [], accCc = 0;

    var j = 0;

    if (!hasStartQuery) {
      start.subtract(req.query.zoneOffset || 0, 'minutes');
    }
    if (!hasEndQuery) {
      end.subtract(req.query.zoneOffset || 0, 'minutes');
    }

    for (var i = 0; i < daysToLook; i++) {
      var workingDate = moment(start).add(i, 'days');
      var currentWc = 0, currentCc = 0;
      if (sessions[j] && moment.utc(sessions[j]['sessions.start']).diff(workingDate, 'days') === 0) {
        currentWc = sessions[j].dailyCount;
        currentCc = sessions[j].dailyCharCount;
        accWc += currentWc;
        accCc += currentCc;
        daily.push(currentWc);
        dailyChar.push(currentCc);
        j++;
      } else {
        daily.push(0);
        dailyChar.push(0);
      }
      daysRange.push(workingDate.format('YYYY-MM-DD'));
      wordcount.push(accWc);
      charcount.push(accCc);
    }

    var result = {
      date: daysRange,
      wordcount: wordcount,
      charcount: charcount,
      worddaily: daily,
      chardaily: dailyChar
    };
    callback(null, result);
  }).catch(function (err) {
    callback(err, {error: err.message});
  });
}

router.get('/', isactivated, sendflash, function (req, res, next) {
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

router.get('/new', isactivated, sendflash, function (req, res) {
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
        charcount: 0,
        targetwc: 50000,
        targetcc: 0,
        genres: req.query.genreid ? [{id: req.query.genreid}] : []
      },
      genres: chunk(genres, 3)
    });
  });
});

router.post('/new', isactivated, isverified, function (req, res, next) {
  var savedProject = {};
  models.Project.create({
    name: req.body.name,
    description: req.body.description,
    wordcount: numerictrim(req.body.wordcount),
    targetwc: numerictrim(req.body.targetwc),
    charcount: numerictrim(req.body.charcount) || 0,
    targetcc: numerictrim(req.body.targetcc) || 0,
    active: !!req.body.active,
    finished: !!req.body.finished,
    public: !!req.body.public,
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
          charcount: req.body.charcount,
          targetcc: req.body.targetcc,
          active: !!req.body.active,
          finished: !!req.body.finished,
          public: !!req.body.public,
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

router.get('/:id/edit', isactivated, sendflash, function (req, res, next) {
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

router.post('/:id/edit', isactivated, isverified, function (req, res, next) {
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
      project.set('wordcount', numerictrim(req.body.wordcount));
      project.set('targetwc', numerictrim(req.body.targetwc));
      project.set('charcount', numerictrim(req.body.charcount) || 0);
      project.set('targetcc', numerictrim(req.body.targetcc) || 0);
      project.set('active', !!req.body.active);
      project.set('finished', !!req.body.finished);
      project.set('public', !!req.body.public);
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
          charcount: req.body.charcount,
          targetcc: req.body.targetcc,
          active: !!req.body.active,
          finished: !!req.body.finished,
          public: !!req.body.public,
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

router.get('/active', isactivated, sendflash, function (req, res, next) {
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
  if (!req.user) {
    req.user = anon;
    res.locals.user = anon;
  }

  models.Project.findOne({
    where: {
      id: req.params.id
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
      return isactivated(req, res, next);
    }

    if (!project.public && project.ownerId !== req.user.id) {
      return isactivated(req, res, next);
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

router.get('/:id/:type.png', function (req, res) {
  res.type('image/png');
  var types = ['cumulative', 'daily'];
  if (_.indexOf(types, req.params.type) < 0 ) {
    return res.status(404).end();
  }
  models.Project.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['id', 'public']
  }).then(function (project) {
    if (!project || !project.public) {
      return res.status(404).end();
    }

    chartData(req, function (err, data) {
      if (err) {
        console.log(err);
        return res.status(500).end();
      }

      var settings = _.defaults({}, {
        chartType: req.params.type
      }, anon.settings),
        file = path.join(config.imagesdir, 'charts', 'projects', req.params.id + '_' + req.params.type + '.png'),
        chart = serverExport.buildChart(project, null, settings, data);
      serverExport.generateImage(file,
        chart,
        function (err, image) {
          if (err) {
            console.log(err);
            return res.status(500).end();
          }
          return res.send(image).end();
        }
      );
    });

  });
});

router.get('/:id/data.json', function (req, res) {
  chartData(req, function (err, data) {
    if (err) {
      console.log(err);
    }
    res.json(data).end();
  });
});

module.exports = router;
