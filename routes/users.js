var router = require('express').Router(),
  _ = require('lodash'),
  models = require('../models'),
  genres = require('./users/genres'),
  isactivated = require('../utils/middlewares/isactivated'),
  sendflash = require('../utils/middlewares/sendflash');

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

genres(router);

module.exports = router;