var router = require("express").Router(),
  models = require('../../models'),
  templates = require('../../utils/data/admin/sgtemplates');

router.get('/', function (req, res) {
  models.User.findAll().then(function (users) {
    res.render('admin/mail', {
      title: 'Mail',
      section: 'adminmail',
      users: users,
      templates: templates
    });
  });
});

module.exports = router;