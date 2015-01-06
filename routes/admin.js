var express = require('express');
var router = express.Router();
var models = require('../models');

function isAdmin(req, res, next) {
	if (req.user && req.user.role === 'superadmin') {
		next();
	} else {
		var err = new Error();
		err.message = 'Not found';
		err.status = 404;
		err.stack = Error.captureStackTrace(this, arguments.calee);
		next(err);
	}
}

router.use('*', isAdmin);

router.get('/', function (req, res, next) {
	models.Invitation.findAll().complete(function (err, codes) {
		if (err) return next(err);
		res.render('admin/index', {
			title: 'Administration',
			section: 'admin',
			codes: codes,
			errorMessage: req.flash('error'),
			successMessage: req.flash('success')
		});
	});
});

router.post('/invitation', function (req, res) {
	var inv = models.Invitation.build();
	inv.set('code', req.body.invCode);
	inv.set('amount', parseInt(req.body.invAmount) || 1);
	inv.save().complete(function (err) {
		if (err) {
			req.flash('error', 'There was an error saving the invitation');
		} else {
			req.flash('success', 'The invitation was successfully saved');
		}
		res.redirect('/admin');
	});
});

module.exports = router;