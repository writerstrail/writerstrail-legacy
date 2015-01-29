var router = require('express').Router();

router.get('/privacy', function (req, res) {
  res.render('info/privacy', {
    title: 'Privacy Policy'
  });
});

router.get('/tos', function (req, res) {
  res.render('info/tos', {
    title: 'Terms of Service'
  });
});

router.get('/donations', function (req, res) {
  res.render('info/donations', {
    title: 'Donate'
  });
});

module.exports = router;