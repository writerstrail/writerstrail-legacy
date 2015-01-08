var express = require('express');
var router = express.Router();
var models = require('../models');
var _ = require('lodash');

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

router.get('/users', function (req, res, next) {
	var regex = /^\d+$/
	var pageSize = 20;
	var deleted = req.query.deleted === 'true';
	var orderBy = req.query.orderby;
	var orderDir = req.query.orderdir;
	if (regex.test(req.query.page)) {
		var currentPage = Math.max(1, parseInt(req.query.page));
	} else {
		var currentPage = 1;
	}
	
	if (!_.contains(['id', 'name', 'createdAt', 'lastAccess'], orderBy)) {
		orderBy = 'createdAt';
	}
	if (!_.contains(['ASC', 'DESC'], orderDir)) {
		orderDir = 'DESC';
	}
	
	models.User.findAndCount({
		limit: pageSize,
		offset: (currentPage - 1) * pageSize,
		order: [[orderBy, orderDir]],
		paranoid: !deleted
	}).success(function (result) {
		var totalPages = Math.ceil(result.count / pageSize);
		
		if (currentPage > totalPages) {
			return res.redirect('/admin/users?page=' + totalPages + (deleted ? '&deleted=true' : ''));
		}
		
		res.render('admin/users', {
			title: 'User administration',
			section: 'adminusers',
			page: currentPage,
			totalPages: totalPages,
			users: result.rows,
			deleted: deleted,
			orderBy: orderBy === 'createdAt' ? null : orderBy,
			orderDir: orderDir === 'DESC' ? null : orderDir,
			successMessage: req.flash('success'),
			errorMessage: req.flash('error'),
			warningMessage: req.flash('warning')
		})
	}).error(function (err) {
		next(err);
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

router.post('/user/edit', function (req, res, next) {
	if (req.body.activate) {
		models.User.find(parseInt(req.body.activate)).complete(function (err, user) {
			if (err) return next(err);
			if (!user) {
				req.flash('error', req.__('No user with id %s', req.body.activate));
				return res.redirect('back');
			} else {
				user.activated = !user.activated;
				user.save().complete(function (err) {
					if (err) {
						req.flash('error', req.__('There was an error saving the user'));
					} else {
						req.flash('success', req.__('User successfully %s', user.activated ? req.__('activated') : req.__('deactivated')));
					}
					return res.redirect('back');
				});
			}
		});
	} else if (req.body.delete) {
		if (req.user.id == req.body.delete) {
			req.flash('error', req.__('You can\'t delete yourself'));
			return res.redirect('back');
		}
		models.User.destroy({
			where: {
				id: req.body.delete
			}
		}).complete(function (err) {
			if (err) {
				req.flash('error', req.__('There was an error deleting the user'));
			} else {
				req.flash('success', req.__('User successfully deleted'));
			}
			return res.redirect('back');
		})
	} else if (req.body.undelete) {
		models.User.restore({
			where: {
				id: parseInt(req.body.undelete)
			}
		}).complete(function (err) {
			if (err) {
				req.flash('error', req.__('There was an error restoring the user'));
			} else {
				req.flash('success', req.__('User successfully restored'));
			}
			res.redirect('back');
		});
	} else if (req.body.bulkActivate === 'true' || req.body.bulkDeactivate === 'true') {
		if (!req.body.selected || req.body.selected.length == 0) {
			req.flash('warning', req.__('No selected users'));
			return res.redirect('back');
		}
		models.User.update({
			activated: (req.body.bulkActivate === 'true') || false
		}, {
			where: {
				id: req.body.selected
			}
		}).complete(function (err) {
			if (err) {
				req.flash('error', req.__('There was an error %s the users', (req.body.bulkActivate ? req.__('activating') : req.__('deactivating'))));
			} else {
				req.flash('success', req.__('Users successfully %s', (req.body.bulkActivate ? req.__('activated') : req.__('deactivated'))));
			}
			res.redirect('back');
		});
	} else if (req.body.bulkDelete === 'true') {
		if (!req.body.selected || req.body.selected.length == 0) {
			req.flash('warning', req.__('No selected users'));
			return res.redirect('back');
		}
		_.remove(req.body.selected, function (value) { 
			return req.user.id == value;
		});
		models.User.destroy({
			where: {
				id: req.body.selected
			}
		}).complete(function (err) {
			if (err) {
				req.flash('error', req.__('There was an error deleting the users'));
			} else {
				req.flash('success', req.__('Users successfully deleted'));
			}
			return res.redirect('back');
		})
	} else if (req.body.bulkRestore === 'true') {
		if (!req.body.selected || req.body.selected.length == 0) {
			req.flash('warning', req.__('No selected users'));
			return res.redirect('back');
		}
		models.User.restore({
			where: {
				id: req.body.selected
			}
		}).complete(function (err) {
			if (err) {
				req.flash('error', req.__('There was an error restoring the users'));
			} else {
				req.flash('success', req.__('Users successfully restored'));
			}
			return res.redirect('back');
		})
	} else {
		res.redirect('back');
	}
});

module.exports = router;