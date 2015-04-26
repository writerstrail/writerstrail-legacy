var router = require('express').Router(),
  models = require('../../models');

router.get('/', function (req, res, next) {
  models.sequelize.query('SELECT * FROM `periods` ORDER BY `start` ASC;')
    .then(function (periods) {
      console.log(periods);
      res.render('admin/periods/index', {
        title: 'Periods',
        section: 'adminperiods',
        periods: periods
      });
    })
    .catch(function (err) {
      next(err);
    });
});

module.exports = router;
