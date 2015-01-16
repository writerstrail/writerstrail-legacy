var router = require('express').Router(),
  _ = require('lodash'),
  models = require('../models'),
  isactivated = require('../utils/middlewares/isactivated');

router.use(isactivated);

router.param('id', function (req, res, next, id) {
  var regex = /\d+/;
  if (regex.test(id)) {
    next();
  } else {
    var err = new Error('Not found');
    err.status = 404;
    next(err);
  }
});

router.get('/genres', function (req, res, next) {
  models.Genre.findAll({
    where: {
      owner_id: req.user.id
    },
    order: [['name', 'ASC']],
    limit: req.query.limit,
    offset: (parseInt(req.query.page, 10) - 1) * parseInt(req.query.limit, 10)
  }).complete(function (err, genres) {
    if (err) { return next(err); }
    res.render('user/genres/list', {
      title: req.__('Genres'),
      section: 'genres',
      genres: genres
    });
  });
});

router.get('/genre/new', function (req, res) {
  res.render('user/genres/single', {
    title: req.__('New genre'),
    section: 'genrenew',
    edit: false,
    action: '/genre/new',
    genre: {}
  });
});

router.post('/genre/new', function (req, res, next) {
  var genre = models.Genre.build();
  genre.set('name', req.body.name);
  genre.set('description', req.body.description);
  genre.set('owner_id', req.user.id);
  genre.save().complete(function (err) {
    if (err) { 
      console.log('---err', err);
      return next(err); }
    if (req.body.create) { return res.redirect('/genres'); }
    res.redirect('/genre/new');
  });
});

router.get('/genre/:id', function (req, res, next) {
  req.user.getGenres({
    where: {
      id: req.params.id
    }
  }).complete(function (err, genres) {
    if (err) { return next(err); }
    if (genres.length !== 1) {
      var error = new Error('Not found');
      error.status = 404;
      return next(error);
    }
    res.render('user/genres/single', {
      title: 'Genre edit',
      section: 'genreedit',
      genre: genres[0]
    });
  });
});

module.exports = router;