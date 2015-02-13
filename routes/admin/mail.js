var router = require("express").Router();

router.get('/', function (req, res) {
  res.render('admin/mail', {
    title: 'Mail',
    section: 'adminmail'
  });
});

module.exports = router;