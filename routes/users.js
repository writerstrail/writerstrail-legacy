var router = require('express').Router(),
	_ = require('lodash'),
	models = require('../models'),
	islogged = require('../utils/middlewares/islogged');

router.use(islogged);

router.get('/genres', function (req, res) {
	res.render('user/genres', {
		title: req.__('Genres'),
		section: 'genres'
	});
})


module.exports = router;