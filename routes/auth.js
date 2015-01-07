var express = require('express');
var Router = express.Router;
var models = require('../models');

module.exports = function (passport) {
	var routes = Router();
	var isLogged = function (req, res, next) {
		if (req.isAuthenticated())
			return next();
		
		res.redirect('/signin');
	};
	
	routes.get('/signin', function (req, res) {
		if (req.isAuthenticated()) {
			res.redirect('/account');
		} else {
			res.render('auth/signin', {
				title: 'Sign in',
				section: 'signin'
			});
		}
	});
	
	routes.get('/signout', function (req, res) {
		req.logout();
		res.redirect('/');
	});
	
	routes.get('/account', isLogged, function (req, res) {
		res.render('user/account', {
			title: 'Account',
			section: 'account',
			successMessage: req.flash('success'),
			errorMessage: req.flash('error')
		});
	});
	
	routes.post('/account', isLogged, function (req, res, next) {
		if (req.body.name) {
			req.user.name = req.body.name;
			req.user.save().complete(function (err, user) {
				if (err) return next(err);
				req.flash('success', res.__('Account sucessfully updated'));
				return res.redirect('/account');
			});
		}
	});
	
	routes.post('/account/delete', isLogged, function (req, res) {
		res.render('user/delete', {
			title: 'Delete account'
		});
	});
	
	routes.post('/account/delete/confirm', isLogged, function (req, res) {
		req.user.destroy().then(function () {
			req.logout();
			req.flash('success', 'Your account was successfully deleted. We\'re sorry to have you gone :(');
			res.redirect('/');
		});
	})
	
	routes.post('/account/activate', isLogged, function (req, res) {
		// Do not let activated users spend codes
		if (req.user.activated) return res.redirect('/account');

		models.Invitation.find({
			where: {
				code: req.body.code
			}
		}).then(function (inv) {
			if (!inv || inv.amount < 1) {
				req.flash('error', req.__('Invalid invitation code'));
				res.redirect('/account');
			} else {
				inv.decrement('amount', { by: 1 }).then(function () {
					req.user.activated = true;
					req.user.save().then(function () {
						req.flash('success', 'Your account was sucessfully activated!');
						res.redirect('/account');
					});
				});
			}
		});
	});
	
	routes.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
	
	routes.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
		successRedirect : '/account',
		failureRedirect : '/signin'
	}));
	
	routes.get('/auth/twitter', passport.authenticate('twitter'));
	
	routes.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
		successRedirect : '/account',
		failureRedirect : '/signin'
	}));
	
	// =====================================
	// GOOGLE ROUTES =======================
	// =====================================
	// send to google to do the authentication
	// profile gets us their basic information including their name
	// email gets their emails
	routes.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
	
	// the callback after google has authenticated the user
	routes.get('/auth/google/callback',
            passport.authenticate('google', {
		successRedirect : '/account',
		failureRedirect : '/signin'
	}));
	
	// facebook -------------------------------
	
	// send to facebook to do the authentication
	routes.get('/connect/facebook', isLogged, passport.authorize('facebook', { scope : 'email' }));
	
	// handle the callback after facebook has authorized the user
	routes.get('/connect/facebook/callback', isLogged,
            passport.authorize('facebook', {
		successRedirect : '/account',
		failureRedirect : '/signin'
	}));
	
	// twitter --------------------------------
	
	// send to twitter to do the authentication
	routes.get('/connect/twitter', isLogged, passport.authorize('twitter'));
	
	// handle the callback after twitter has authorized the user
	routes.get('/connect/twitter/callback', isLogged,
            passport.authorize('twitter', {
		successRedirect : '/account',
		failureRedirect : '/signin'
	}));
	
	
	// google ---------------------------------
	
	// send to google to do the authentication
	routes.get('/connect/google', isLogged, passport.authorize('google', { scope : ['profile', 'email'] }));
	
	// the callback after google has authorized the user
	routes.get('/connect/google/callback', isLogged,
            passport.authorize('google', {
		successRedirect : '/account',
		failureRedirect : '/signin'
	}));
	
	// =============================================================================
	// UNLINK ACCOUNTS =============================================================
	// =============================================================================
	// used to unlink accounts. for social accounts, just remove the token
	// user account will stay active in case they want to reconnect in the future
	
	// facebook -------------------------------
	routes.get('/unlink/facebook', isLogged, function (req, res) {
		var user = req.user;
		user.facebookToken = null;
		user.save().complete(function (err) {
			res.redirect('/account');
		});
	});
	
	// twitter --------------------------------
	routes.get('/unlink/twitter', isLogged, function (req, res) {
		var user = req.user;
		user.twitterToken = null;
		user.save().complete(function (err) {
			res.redirect('/account');
		});
	});
	
	// google ---------------------------------
	routes.get('/unlink/google', isLogged, function (req, res) {
		var user = req.user;
		user.googleToken = null;
		user.save().complete(function (err) {
			res.redirect('/account');
		});
	});
	
	return routes;
}