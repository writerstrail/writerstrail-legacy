var express = require('express'),
  Router = express.Router,
  models = require('../models'),
  _ = require('lodash'),
  islogged = require('../utils/middlewares/islogged');

module.exports = function (passport) {
  var routes = Router();
  
  routes.get('/signin', function (req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/account');
    } else {
      var validation = req.flash('valerror');
      console.log('----got err', validation);
      res.render('auth/signin', {
        title: 'Sign in',
        section: 'signin',
        errorMessage: req.flash('error'),
        validate: validation[0] ? validation[0].errors : [],
        data: req.flash('data')[0] || {}
      });
    }
  });
  
  routes.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
  
  routes.get('/account', islogged, function (req, res) {
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
  
  routes.post('/account', islogged, function (req, res, next) {
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
  
  routes.post('/account/delete', islogged, function (req, res) {
    res.render('user/delete', {
      title: 'Delete account'
    });
  });
  
  routes.post('/account/delete/confirm', islogged, function (req, res) {
    req.user.destroy().then(function () {
      req.logout();
      req.flash('success', 'Your account was successfully deleted. We\'re sorry to have you gone <span class="fa fa-frown-o"></span>');
      res.redirect('/');
    });
  });
  
  routes.post('/account/activate', islogged, function (req, res) {
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
      if (err) {
        console.log(err); return next(err);
      }
      if (!user) { return res.redirect('/signin'); }
      req.logIn(user, function (err) {
        if (err) { return next(err); }
        var ref = req.session.referrer;
        if (ref) {
          delete req.session.referrer;
          return res.redirect(ref);
        }
        return res.redirect('/dashboard');
      });
    })(req, res, next);
  };
  
  routes.post('/auth/signup', function (req, res, next) {
    authFunction('local-signup', req, res, next);
  });
  
  routes.post('/auth/signin', function (req, res, next) {
    authFunction('local-signin', req, res, next);
  });
 
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
  routes.get('/connect/facebook', islogged, passport.authorize('facebook', { scope: 'email' }));
  
  // handle the callback after facebook has authorized the user
  routes.get('/connect/facebook/callback', islogged,
passport.authorize('facebook', {
    successRedirect: '/account',
    failureRedirect: '/signin'
  }));
  
  
  // google ---------------------------------
  
  // send to google to do the authentication
  routes.get('/connect/google', islogged, passport.authorize('google', { scope: ['profile', 'email'] }));
  
  // the callback after google has authorized the user
  routes.get('/connect/google/callback', islogged,
passport.authorize('google', {
    successRedirect: '/account',
    failureRedirect: '/signin'
  }));
  
  // linkedin ---------------------------------
  
  // send to linkedin to do the authentication
  routes.get('/connect/linkedin', islogged, passport.authorize('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
  
  // the callback after google has authorized the user
  routes.get('/connect/linkedin/callback', islogged,
passport.authorize('linkedin', {
    successRedirect: '/account',
    failureRedirect: '/signin'
  }));
  
  
  // wordpress ---------------------------------
  
  // send to wordpress to do the authentication
  routes.get('/connect/wordpress', islogged, passport.authorize('wordpress', { scope: ['auth'] }));
  
  // handle the callback after facebook has authorized the user
  routes.get('/connect/wordpress/callback', islogged,
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
  routes.get('/unlink/facebook', islogged, function (req, res) {
    var user = req.user;
    user.facebookToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  // google ---------------------------------
  routes.get('/unlink/google', islogged, function (req, res) {
    var user = req.user;
    user.googleToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  // linkedin ---------------------------------
  routes.get('/unlink/linkedin', islogged, function (req, res) {
    var user = req.user;
    user.linkedinToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  // wordpress ---------------------------------
  routes.get('/unlink/wordpress', islogged, function (req, res) {
    var user = req.user;
    user.wordpressToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  return routes;
};