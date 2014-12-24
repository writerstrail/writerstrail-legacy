var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Writer\'s Trail', section:'home' });
});

module.exports = router;