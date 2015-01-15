var router = require('express').Router(),
	_ = require('lodash'),
	models = require('../models'),
	isactivated = require('../utils/middlewares/isactivated');

router.use(isactivated);

router.get('/genres', function (req, res) {
	res.render('user/genres', {
		title: req.__('Genres'),
		section: 'genres'
	});
})


module.exports = router;