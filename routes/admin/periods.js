var router = require('express').Router(),
  models = require('../../models');

router.get('/', function (req, res) {
  res.render('admin/periods/index', {
    title: 'Periods',
    section: 'adminperiods'
  });
});

module.exports = router;
