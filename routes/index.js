var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { section: 'home', successMessage: req.flash('success') });
});

module.exports = router;
