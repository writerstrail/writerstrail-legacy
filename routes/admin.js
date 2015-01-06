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
	models.Invitation.findOrCreate({
		where: { code: req.body.invCode },
		defaults: {
			code: req.body.invCode,
			amount: req.body.invAmount
		}
	})
	 .then(function (params) {
		var inv = params[0];
		var created = params[1];
		if (!inv) { req.flash('error', 'There was an error saving the invitation'); }
		else {
			if (!created) {
				inv.increment('amount', { by: req.body.invAmount }).then(function () {
					req.flash('success', 'The invitation was successfully saved');
					res.redirect('/admin');
				});
			} else {
				req.flash('success', 'The invitation was successfully saved')
				res.redirect('/admin');
			}
		}
	}).catch(function (err) {
		req.flash('error', 'There was an error saving the invitation');
		res.redirect('/admin');
	});
});

router.post('/deleteinvitation', function (req, res) {
	models.Invitation.find({
		where: {
			id: parseInt(req.body.invId)
		}
	}).complete(function (err, inv) {
		if (err) {
			req.flash('error', err.message);
			res.redirect('/admin');
		} else {
			inv.destroy().then(function () {
				req.flash('success', 'The invitation was successfully deleted');
				res.redirect('/admin');
			});
		}
	});
});

module.exports = router;