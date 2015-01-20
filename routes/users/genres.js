var router = require('express').Router(),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash');
  
router.get('/genres', sendflash, function (req, res, next) {
  models.Genre.findAndCountAll({
    where: {
      ownerId: req.user.id
    },
    order: [['name', 'ASC']],
    limit: req.query.limit,
    offset: (parseInt(req.query.page, 10) - 1) * parseInt(req.query.limit, 10)
  }).then(function (result) {
    var genres = result.rows,
      count = result.count;
    res.render('user/genres/list', {
      title: req.__('Genres'),
      section: 'genres',
      genres: genres,
      pageCount: Math.ceil(count / parseInt(req.query.limit, 10)),
      currentPage: req.query.page
    });
  }).catch(function (err) {
    return next(err);
  });
});

router.get('/genres/new', sendflash, function (req, res) {
  res.render('user/genres/edit', {
    title: req.__('New genre'),
    section: 'genrenew',
    edit: false,
    genre: {}
  });
});

router.post('/genres/new', function (req, res, next) {
  models.Genre.create({
    name: req.body.name,
    description: req.body.description,
    ownerId: req.user.id
  }).then(function () {
    req.flash('success', req.__('Genre "%s" successfully created', req.body.name));
    if (req.body.create) { return res.redirect('/genres'); }
    res.redirect('/genres/new');
  }).catch(function (err) {
    if (err.message !== 'Validation error') { return next(err); }
    res.render('user/genres/edit', {
      title: req.__('New genre'),
      section: 'genrenew',
      edit: false,
      genre: {
        name: req.body.name,
        description: req.body.description
      },
      validate: err.errors,
      errorMessage: req.__('There are invalid values')
    });

  });
});

router.get('/genres/:id/edit', sendflash, function (req, res, next) {
  req.user.getGenres({
    where: {
      id: req.params.id
    }
  }).then(function (genres) {
    if (genres.length !== 1) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    res.render('user/genres/edit', {
      title: 'Genre edit',
      section: 'genreedit',
      genre: genres[0],
      edit: true
    });
  }).catch(function (err) {
    next(err);
  });
});

router.post('/genres/:id/edit', function (req, res, next) {
  req.user.getGenres({
    where: {
      id: req.params.id
    }
  }).then(function (genres) {
    if (genres.length !== 1) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    if (!req.body.delete) {
      genres[0].set('name', req.body.name);
      genres[0].set('description', req.body.description);
      return genres[0].save();
    }
    return genres[0].destroy();
  }).then(function () {
    var msg = (!!req.body.save) ? req.__('Genre %s successfully saved.') : req.__('Genre %s successfully deleted.');
    req.flash('success', req.__(msg, req.body.name));
    if (!!req.body.save) {
      res.redirect('back');
    } else {
      res.redirect('/genres');
    }
  }).catch(function (err) {
    if (err.message !== 'Validation error') { return next(err); }
    res.render('user/genres/edit', {
      title: req.__('Edit genre'),
      section: 'genreedit',
      edit: true,
      genre: {
        name: req.body.name,
        description: req.body.description
      },
      validate: err.errors,
      errorMessage: req.__('There are invalid values')
    });
  });
});

router.get('/genres/:id', sendflash, function (req, res, next) {
  models.Genre.findOne({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    },
    include: [{
      model: models.Project,
      as: 'projects'
    }]
  }).then(function (genre) {
    if (!genre) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    res.render('user/genres/single', {
      title: 'Genre ' + genre.name,
      section: 'genresingle',
      genre: genre
    });
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;