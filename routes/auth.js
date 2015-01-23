var express = require('express'),
  Router = express.Router,
  models = require('../models'),
  _ = require('lodash'),
  isLogged = require('../utils/middlewares/islogged');

module.exports = function (passport) {
  var routes = Router();
  
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
      emails: _.uniq(_.compact([
        req.user.email,
        req.user.facebookEmail,
        req.user.googleEmail,
        req.user.linkedinEmail,
        req.user.wordpressEmail
      ])),
      successMessage: req.flash('success'),
      errorMessage: req.flash('error')
    });
  });
  
  routes.post('/account', isLogged, function (req, res, next) {
    if (req.body.name) {
      req.user.name = req.body.name;
      var validemails = _.uniq(_.compact([
        req.user.email,
        req.user.facebookEmail,
        req.user.googleEmail,
        req.user.linkedinEmail,
        req.user.wordpressEmail
      ]));
      if (_.contains(validemails, req.body.email)) {
        req.user.email = req.body.email;
      }
      req.user.save().then(function () {
        req.flash('success', res.__('Account sucessfully updated'));
        return res.redirect('/account');
      }).catch(function (err) {
        return next(err);
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
      req.flash('success', 'Your account was successfully deleted. We\'re sorry to have you gone <span class="fa fa-frown-o"></span>');
      res.redirect('/');
    });
  });
  
  routes.post('/account/activate', isLogged, function (req, res) {
    // Do not let activated users spend codes
    if (req.user.activated) {
      req.flash('error', 'You are already activated');
      return res.redirect('/account');
    }
    
    models.Invitation.find({
      where: {
        code: req.body.code,
        amount: {
          gt: 0
        }
      }
    }).then(function (inv) {
      if (!inv) {
        req.flash('error', req.__('Invalid invitation code'));
        res.redirect('/account');
      } else {
        inv.decrement('amount', { by: 1 }).then(function () {
          req.user.activated = true;
          req.user.invitationCode = inv.code;
          req.user.save().then(function () {
            req.flash('success', 'Your account was sucessfully activated!');
            res.redirect('/account');
          });
        });
      }
    });
  });

 // AUTH ROUTES
  
  var authFunction = function (strategy, req, res, next) {
    passport.authenticate(strategy, function (err, user) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/signin'); }
      req.logIn(user, function (err) {
        if (err) { return next(err); }
        var ref = req.session.referrer;
        if (ref) {
          delete req.session.referrer;
          return res.redirect(ref);
        }
        return res.redirect('/projects/active');
      });
    })(req, res, next);
  };
 
  routes.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
  
  routes.get('/auth/facebook/callback', function (req, res, next) {
    authFunction('facebook', req, res, next);
  });
  
  routes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  // the callback after google has authenticated the user
  routes.get('/auth/google/callback', function (req, res, next) {
    authFunction('google', req, res, next);
  });
  
  
  routes.get('/auth/linkedin', passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
  
  // the callback after linkedin has authenticated the user
  routes.get('/auth/linkedin/callback', function (req, res, next) {
    authFunction('linkedin', req, res, next);
  });
  
  routes.get('/auth/wordpress', passport.authenticate('wordpress', { scope: ['auth'] }));
  
  // the callback after wordpress has authenticated the user
  routes.get('/auth/wordpress/callback', function (req, res, next) {
    authFunction('wordpress', req, res, next);
  });
 
 // CONNECT ROUTES
  
  // facebook -------------------------------
  
  // send to facebook to do the authentication
  routes.get('/connect/facebook', isLogged, passport.authorize('facebook', { scope: 'email' }));
  
  // handle the callback after facebook has authorized the user
  routes.get('/connect/facebook/callback', isLogged,
passport.authorize('facebook', {
    successRedirect: '/account',
    failureRedirect: '/signin'
  }));
  
  
  // google ---------------------------------
  
  // send to google to do the authentication
  routes.get('/connect/google', isLogged, passport.authorize('google', { scope: ['profile', 'email'] }));
  
  // the callback after google has authorized the user
  routes.get('/connect/google/callback', isLogged,
passport.authorize('google', {
    successRedirect: '/account',
    failureRedirect: '/signin'
  }));
  
  // linkedin ---------------------------------
  
  // send to linkedin to do the authentication
  routes.get('/connect/linkedin', isLogged, passport.authorize('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
  
  // the callback after google has authorized the user
  routes.get('/connect/linkedin/callback', isLogged,
passport.authorize('linkedin', {
    successRedirect: '/account',
    failureRedirect: '/signin'
  }));
  
  
  // wordpress ---------------------------------
  
  // send to wordpress to do the authentication
  routes.get('/connect/wordpress', isLogged, passport.authorize('wordpress', { scope: ['auth'] }));
  
  // handle the callback after facebook has authorized the user
  routes.get('/connect/wordpress/callback', isLogged,
passport.authorize('wordpress', {
    successRedirect: '/account',
    failureRedirect: '/signin'
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
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  // google ---------------------------------
  routes.get('/unlink/google', isLogged, function (req, res) {
    var user = req.user;
    user.googleToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  // linkedin ---------------------------------
  routes.get('/unlink/linkedin', isLogged, function (req, res) {
    var user = req.user;
    user.linkedinToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  // wordpress ---------------------------------
  routes.get('/unlink/wordpress', isLogged, function (req, res) {
    var user = req.user;
    user.wordpressToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  return routes;
};