var router = require('express').Router(),
	_ = require('lodash'),
	models = require('../models'),
	isactivated = require('../utils/middlewares/isactivated');

router.use(isactivated);

router.get('/genres', function (req, res, next) {
	models.Genre.findAll({
		where: {
			owner_id: req.user.id
		},
		order: [['name', 'ASC']]
	}).complete(function (err, genres) {
		if (err) return next(err);
		res.render('user/genres', {
			title: req.__('Genres'),
			section: 'genres',
			genres: genres
		});
	});
})

module.exports = router;