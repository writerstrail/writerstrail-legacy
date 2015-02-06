var router = require('express').Router();

router.get('/features', function (req, res) {
  res.render('info/features', {
    title: 'Features',
    section: 'features'
  });
});

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

router.get('/help', function (req, res) {
  res.render('info/help', {
    title: 'Help',
    section: 'help'
  });
});


router.get('/license', function (req, res) {
  res.render('info/license', {
    title: 'License'
  });
});


module.exports = router;