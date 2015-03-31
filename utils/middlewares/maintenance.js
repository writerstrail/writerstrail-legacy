// Maintenance middleware
var http = require('request'),
  router = require('express').Router(),
  models = require('../../models'),
  _ = require('lodash'),
  allowedUrls= ['/', '/features', '/tos', '/privacy', '/donations'];

router.use(function maintenance(req, res, next) {
  models.App.findOne(1).then(function (app) {
    res.locals.app = app;

    if (app.maintenance === 'soft') {
      req.flash('maintenance', "Writer's Trail is under maintenance. You may experience some issues.");
    } else if (app.maintenance === 'hard') {
      if ((req.query.maintenance === process.env.WRITERSTRAIL_MAINTENANCE_KEY) || (req.user && req.user.role === 'superadmin')) {
        return next();
      } else {
        req.logout();
        if (_.some(allowedUrls, function (i) {
            return req.originalUrl === i;
          })) {
          return next();
        }
        return http.get('http://thecatapi.com/api/images/get?format=html&type=jpg,png&size=med', function (err, resp, cat) {
          return res.render('error/maintenance', {
            cat: cat
          });
        });
      }
    }

    if (app.sysmsg) {
      req.flash('maintenance', app.sysmsg);
    }

    return next();
  }).catch(function () {
    next();
  });
});

module.exports = router;