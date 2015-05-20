var router = require('express').Router(),
  qs = require('querystring'),
  _ = require('lodash'),
  moment = require('moment'),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  isverified = require('../../utils/middlewares/isverified'),
  isactivated = require('../../utils/middlewares/isactivated'),
  chunk = require('../../utils/functions/chunk'),
  numerictrim = require('../../utils/functions/numerictrim'),
  filterIds = require('../../utils/functions/filterids'),
  serverExport = require('../../utils/chart-export/server-export'),
  anon = require('../../utils/data/anonuser');

function filterQuery(query) {
  var result = {};
  [
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

  var daysToLook = 30;
  var start = moment.utc(req.query.start, 'YYYY-MM-DD').startOf('day');
  var end = moment.utc(req.query.end, 'YYYY-MM-DD').endOf('day');

  var before;

  if (!start.isValid() || start.isAfter(end)) {
    start = moment.utc().subtract(daysToLook - 1, 'days').subtract(req.query.zoneOffset || 0, 'minutes').startOf('day');
  }
  if (!end.isValid() || start.isAfter(end)) {
    end = moment.utc().subtract(req.query.zoneOffset || 0, 'minutes').endOf('day');
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
            lt: start.toDate()
          }
        },
        attributes: [
          models.Sequelize.literal('SUM(`sessions`.`wordcount`) AS `beforeWordcount`'),
          models.Sequelize.literal('SUM(`sessions`.`charcount`) AS `beforeCharcount`')
        ],
        required: true
      }
    ]
  }, {
    raw: true
  }).then(function (beforeSum) {
    before = beforeSum;

    return models.Project.findAll({
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
    });
  }).then(function (sessions) {

    var accessible = false;

    if (sessions.length > 0 && (sessions[0].public > 0 || sessions[0].ownerId === user.id)) {
      accessible = true;
    }

    if (!accessible) {
      sessions = [];
    }

    var daysRange = [];
    var daily = [], dailyChar = [];
    var wordcount = [], accWc = (before && before[0]) ? (before[0].beforeWordcount || 0) : 0;
    var charcount = [], accCc = (before && before[0]) ? (before[0].beforeCharcount || 0) : 0;

    var j = 0;

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

    var chartOptions, visibility = {}, query = filterQuery(req.query);

    visibility.wordcount = visibility.charcount = false;
    visibility.worddaily = visibility.chardaily = true;

    if (sessions[0]) {
      chartOptions = sessions[0].chartOptionsBlob;
    }

    chartOptions = chartOptions ? JSON.parse(chartOptions) : {};

    result.visibility = _.defaults(query, chartOptions, visibility);

    callback(null, result);
  }).catch(function (err) {
    err.code = 500;
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
        targetunit: 'word',
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
    targetunit: req.body.targetunit,
    active: !!req.body.active,
    finished: !!req.body.finished,
    public: !!req.body.public,
    zoneOffset: req.body.zoneOffset || 0,
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
          targetunit: req.body.targetunit,
          active: !!req.body.active,
          finished: !!req.body.finished,
          public: !!req.body.public,
          zoneOffset: req.body.zoneOffset || 0,
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

router.get('/embed/:id', function (req, res, next) {
  models.Project.findOne({
    where: {
      id: req.params.id,
      "public": true
    }
  }).then(function (project) {
    if (!project) {
      return next();
    }
    res.render('user/embed', {
      title: 'Project ' + project.name,
      object: project,
      datalink: '/projects/' + project.id + '/data.json',
      objectlink: '/projects/' + project.id,
      query: qs.stringify(filterQuery(req.query))
    });
  }).catch(function (err) {
    next(err);
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
      project.set('targetunit', req.body.targetunit);
      project.set('active', !!req.body.active);
      project.set('finished', !!req.body.finished);
      project.set('zoneOffset', req.body.zoneOffset || 0);
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
          targetunit: req.body.targetunit,
          active: !!req.body.active,
          finished: !!req.body.finished,
          public: !!req.body.public,
          zoneOffset: req.body.zoneOffset || 0,
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
        'LEAST(100, GREATEST(0, FLOOR(' +
        'CASE WHEN `targetunit` LIKE "word"  THEN ' +
        '((`currentWordcount` + `correctwc`) / `targetwc`)' +
        'ELSE ' +
        '((`currentCharcount` + `correctcc`) / `targetcc`)' +
        'END' +
        ' * 100)))'
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
      project: project,
      socialMeta: {
        title: project.name,
        description: project.description || 'A writing project in Writer\'s Trail.',
        image: '/projects/' + project.id + '/daily.png',
        type: 'project',
        url: '/projects/' + project.id
      }
    });
    
  }).catch(function (err) {
    next(err);
  });
});

router.get('/:id/:type.png', serverExport.middleware('Project', chartData));

router.get('/:id/deleteImage', isactivated, serverExport.deleteImageMiddleware('Project'));

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
    return models.Project.findOne({
      where: {
        id: req.params.id,
        ownerId: req.user.id
      }
    }).then(function (project) {
      if (!project) {
        return res.status(404).end();
      }
      var options = project.chartOptions;
      options[item] = visibility;
      project.chartOptions = options;
      return project.save();
    });
  }).then(function () {
    return res.status(204).end();
  }).catch(function (err) {
    console.log(err);
    return res.status(500).end();
  });
});

router.post('/:id/correctwc', isactivated, function (req, res) {
  models.Project.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    }
  }).then(function (project) {
    if (!project) {
      return res.status(404).json({error: 'Not found'});
    }

    var newWc = req.body.correctwc;

    if (newWc !== 'reset') {
      newWc = parseInt(newWc, 10);

      if (isNaN(newWc) || newWc < 0) {
        return res.status(400).json({
          error: 'The corrected wordcount must be a non-negative integer'
        });
      }
    }

    project.correctwc = newWc === 'reset' ? 0 : newWc - project.currentWordcount;

    return project.save();
  }).then(function () {
    return res.status(200).json({
      message: 'Wordcount updated'
    });
  }).catch(function (err) {
    console.log(err);
    return res.status(500).json({
      error: 'Database error'
    });
  });
});

router.post('/:id/correctcc', isactivated, function (req, res) {
  models.Project.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    }
  }).then(function (project) {
    if (!project) {
      return res.status(404).json({error: 'Not found'});
    }

    var newCc = req.body.correctcc;

    if (newCc !== 'reset') {
      newCc = parseInt(newCc, 10);

      if (isNaN(newCc) || newCc < 0) {
        return res.status(400).json({
          error: 'The corrected character count must be a non-negative integer'
        });
      }
    }

    project.correctcc = newCc === 'reset' ? 0 : newCc - project.currentCharcount;

    return project.save();
  }).then(function () {
    return res.status(200).json({
      message: 'Character count updated'
    });
  }).catch(function (err) {
    console.log(err);
    return res.status(500).json({
      error: 'Database error'
    });
  });
});

module.exports = router;
