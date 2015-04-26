var router = require('express').Router(),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash');

router.get('/', sendflash, function (req, res, next) {
  models.sequelize.query('SELECT * FROM `periods` ORDER BY `start` ASC;')
    .then(function (periods) {
      var valerror = req.flash('valerror'),
        data = req.flash('periodsdata');
      res.render('admin/periods/index', {
        title: 'Periods',
        section: 'adminperiods',
        periods: periods,
        valerror: valerror.length ? valerror[0] : null,
        data: data.length ? data[0] : {}
      });
    })
    .catch(function (err) {
      next(err);
    });
});

router.post('/', function (req, res) {
  function validationError(field, message) {
    req.flash('error', 'There are validation errors');
    req.flash('valerror', {
      field: field,
      msg: message
    });
    req.flash('periodsdata', {
      name: req.body.name,
      start: req.body.start,
      end: req.body.end
    });
  }

  function trim(value) {
    return value ? value.toString().trim() : '';
  }

  function validateTime(time) {
    var regexTest = /^\d\d:\d\d:\d\d$/g;
    return regexTest.test(time);
  }

  var name = trim(req.body.name),
    start = trim(req.body.start),
    end = trim(req.body.end);

  if (!name) {
    validationError('name', 'Name is required');
    return res.redirect('/admin/periods');
  }

  if (!start) {
    validationError('start', 'Start is required');
    return res.redirect('/admin/periods');
  }

  if (!end) {
    validationError('end', 'End is required');
    return res.redirect('/admin/periods');
  }

  if (!validateTime(start)) {
    validationError('start', 'Start must be a valid time');
    return res.redirect('/admin/periods');
  }

  if (!validateTime(end)) {
    validationError('end', 'End must be a valid time');
    return res.redirect('/admin/periods');
  }

  models.sequelize.query("INSERT INTO `periods` (`name`, `start`, `end`) " +
    "VALUES (" + models.sequelize.escape(name) + ", " +
    models.sequelize.escape(start) + ", " +
    models.sequelize.escape(end) + ")", null, {
    type: models.Sequelize.QueryTypes.INSERT,
    raw: true
  })
    .then(function () {
      req.flash('success', 'Period added');
    })
    .catch(function (err) {
      req.flash('error', 'Database error: ' + err.message);
      req.flash('periodsdata', {
        name: req.body.name,
        start: req.body.start,
        end: req.body.end
      });
    })
    .finally(function () {
      res.redirect('/admin/periods');
    });
});

router.get('/delete/:name', function (req, res) {
  models.sequelize.query('DELETE FROM `periods` WHERE name=' +
    models.sequelize.escape(req.params.name), null, {
    type: models.Sequelize.QueryTypes.DELETE,
    raw: true
  })
    .then(function () {
      req.flash('success', 'Period deleted');
    })
    .catch(function (err) {
      req.flash('error', 'Database error: ' + err.message);
    })
    .finally(function () {
      res.redirect('/admin/periods');
    });
});

module.exports = router;
