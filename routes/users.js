var router = require('express').Router(),
  genres = require('./users/genres'),
  projects = require('./users/projects'),
  targets = require('./users/targets'),
  sessions = require('./users/sessions'),
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

router.use(genres);
router.use('/projects', projects);
router.use(targets);
router.use(sessions);

module.exports = router;