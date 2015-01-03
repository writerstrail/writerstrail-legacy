var express = require('express');
var Router = express.Router;
var i18n = require('i18n');

module.exports = function (passport) {
	var routes = Router();
	var isLogged = function (req, res, next) {
		if (req.isAuthenticated())
			return next();
		
		res.redirect('/signin');
	};
	
	routes.get('/signin', function (req, res) {
		res.render('auth/signin', {
			title: 'Sign in',
			section: 'signin'
		})
	});
	
	routes.get('/signout', function (req, res) {
		req.logout();
		res.redirect('/');
	});
	
	routes.get('/profile', isLogged, function (req, res) {
		res.render('user/profile', {
			title: 'Profile',
			section: 'profile',
			user: req.user
		});
	});
	
	routes.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

	routes.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
		successRedirect : '/profile',
		failureRedirect : '/signin'
	}));
	
	routes.get('/auth/twitter', passport.authenticate('twitter'));

	routes.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
		successRedirect : '/profile',
		failureRedirect : '/signin'
	}));
	
	return routes;
}