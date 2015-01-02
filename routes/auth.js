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
			section: 'profile'
		});
	});
	
	return routes;
}