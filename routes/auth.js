var express = require('express'),
  Router = express.Router,
  models = require('../models'),
  _ = require('lodash'),
  promise = require('sequelize').Promise,
  moment = require('moment'),
  islogged = require('../utils/middlewares/islogged'),
  sendflash = require('../utils/middlewares/sendflash'),
  sendverify = require('../utils/functions/sendverify'),
  sendpassrecover = require('../utils/functions/sendpassrecover'),
  ValidationError = require('sequelize').ValidationError,
  ValidationErrorItem = require('sequelize').ValidationErrorItem;

module.exports = function (passport) {
  var router = Router();
  
  router.get('/signin', sendflash, function (req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/account');
    } else {
      var validation = req.flash('valerror');
      res.render('auth/signin', {
        title: 'Sign in',
        section: 'signin',
        validate: validation[0] ? validation[0].errors : [],
        data: req.flash('data')[0] || {}
      });
    }
  });
  
  router.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
  
  router.get('/account', islogged, sendflash, function (req, res) {
    var validate = req.flash('valerror');
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
      validate: validate[0] ? validate[0].errors : [],
      data: req.flash('data')[0] || {}
    });
  });
  
  router.post('/account', islogged, function (req, res, next) {
    req.user.name = req.body.name || '';
    var validemails = _.uniq(_.compact([
      req.user.facebookEmail,
      req.user.googleEmail,
      req.user.linkedinEmail,
      req.user.wordpressEmail,
      req.user.verifiedEmail
    ]));
    var emailChanged = false;
    if (req.user.email !== req.body.email) {
      emailChanged = true;
      req.user.email = req.body.email;
      if (!_.contains(validemails, req.body.email)) {
        req.user.verified = false;
      } else {
        req.user.verified = true;
      }
    }
    if (req.body.newpassword) {
      var err = null;
      if (req.user.password) {
        if (!req.user.validPassword(req.body.oldpassword)) {
          err = new ValidationError('Validation error', [
            new ValidationErrorItem('The old password does not match', 'oldpassword', 'oldpassword', '')
          ]);
        }
      } else {
        if (req.body.oldpassword) {
          err = new ValidationError('Validation error', [
            new ValidationErrorItem('The old password does not match', 'oldpassword', 'oldpassword', '')
          ]);
        }
      }
      
      if (!err && req.body.newpassword !== req.body.confirmpassword) {
        err = new ValidationError('Validation error', [
          new ValidationErrorItem('The new password does not match the confirmation', 'confirm', 'password', '')
        ]);
      }
      
      if (err) {
        req.flash('error', 'There are invalid values');
        req.flash('valerror', err);
        req.flash('data', { name: req.body.name, email: req.body.email });
        return res.redirect('back');
      } else {
        req.user.password = req.body.newpassword;
      }
    }
    req.user.save().then(function (user) {
      req.flash('success', res.__('Account sucessfully updated'));
      if (emailChanged && !user.verified) {
        sendverify(req.user, function (err) {
          if (err) {
            req.flash('error', 'There was an error while trying to send your email. Try again later.');
          } else {
            req.flash('success', 'Your confirmation message was sent. Check your email inbox.');
          }
          return res.redirect('back');
        });
      } else {
        return res.redirect('back');
      }
    }).catch(function (err) {
      if (err.name === 'SequelizeValidationError') {
        req.flash('error', 'There are invalid values');
        req.flash('valerror', err);
        req.flash('data', { name: req.body.name, email: req.body.email });
        return res.redirect('back');
      }
      return next(err);
    });
  });
  
  router.post('/account/delete', islogged, function (req, res) {
    res.render('user/delete', {
      title: 'Delete account'
    });
  });
  
  router.post('/account/delete/confirm', islogged, function (req, res) {
    req.user.destroy().then(function () {
      req.logout();
      req.flash('success', 'Your account was successfully deleted. We\'re sorry to have you gone <span class="fa fa-frown-o"></span>');
      res.redirect('/');
    });
  });
  
  router.post('/account/activate', islogged, function (req, res) {
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
  
  router.get('/account/verify/resend', islogged, function (req, res) {
    if (req.user.verified) {
      req.flash('error', 'Your email address is already verified');
      return res.redirect('/account');
    }
    sendverify(req.user, function (err) {
      if (err) {
        req.flash('error', 'There was an error while trying to send your email. Try again later.');
      } else {
        req.flash('success', 'Your confirmation message was sent. Check your email inbox.');
      }
      res.redirect('/account');
    });
  });
  
  router.get('/account/verify/:token', islogged, function (req, res) {
    models.Token.findOne({
      where: {
        ownerId: req.user.id,
        token: {
          like: req.params.token
        },
        type: 'email'
      }
    }).then(function (token) {
      if (!token) {
        return promise.reject('Invalid token');
      }
      if (moment(token.expire).isBefore(moment())) {
        token.destroy();
        return promise.reject('Invalid token');
      }
      if (token.data !== req.query.email) {
        return promise.reject('Invalid token');
      }
      return token.destroy();
    }).then(function () {
      req.user.verified = true;
      req.user.verifiedEmail = req.query.email;
      return req.user.save();
    }).then(function () {
      req.flash('success', 'Your email address is now confirmed.');
    }).catch(function (err) {
      if (err !== 'Invalid token') {
        req.flash('error', 'There was an error while trying to verify your email. Try again later.');
      } else {
        req.flash('error', 'Invalid request');
      }
    }).finally(function () {
      res.redirect('/account');
    });
  });
  
  router.get('/password/recover', function (req, res) {
    res.render('auth/recover', {
      title: 'Recover password'
    });
  });
  
  router.post('/password/recover', function (req, res) {
    models.User.findOne({
      where: models.Sequelize.or(
        { email: { like: req.body.email } },
        { verifiedEmail: { like: req.body.email } }
      )
    }).then(function (user) {
      if (!user) {
        req.flash('There was an error while trying to send your email. Try again later.');
        return res.redirect('/signin');
      }
      sendpassrecover(user, req.body.email, function (err) {
        if (err) {
          req.flash('error', 'There was an error while trying to send your email. Try again later.');
        } else {
          req.flash('success', 'Your recovery was sent. Check your email inbox.');
        }
        res.redirect('/signin');
      });
    }).catch(function () {
      req.flash('error', 'There was an unknown error. Try again later.');
      res.redirect('/signin');
    });
  });
  
  router.get('/password/recover/:token', function (req, res) {
    models.Token.findOne({
      where: {
        type: 'password',
        token: { like: req.params.token },
        data: { like: req.query.email }
      }
    }).then(function (token) {
      if (!token) {
        return promise.reject('No token');
      }
      if (moment().isAfter(moment(token.expire))) {
        token.destroy();
        return promise.reject('Expired token');
      }
      return models.User.findOne({
        where: {
          id: token.ownerId
        }
      });
    }).then(function (user) {
      if (!user) {
        return promise.reject('No user');
      }
      res.render('auth/newpassword', {
        title: 'Change password',
        user: user,
        usedemail: req.query.email
      });
    }).catch(function () {
      req.flash('error', 'Invalid request');
      res.redirect('/signin');
    });
  });
  
  router.post('/password/recover/:token', function (req, res) {
    var savedToken = null,
      savedUser = null;
    
    models.Token.findOne({
      where: {
        type: 'password',
        token: { like: req.params.token },
        data: { like: req.query.email }
      }
    }).then(function (token) {
      if (!token) {
        return promise.reject('No token');
      }
      if (moment().isAfter(moment(token.expire))) {
        token.destroy();
        return promise.reject('Expired token');
      }
      
      savedToken = token;
      
      return models.User.findOne({
        where: {
          id: token.ownerId
        }
      });
    }).then(function (user) {
      if (!user) {
        return promise.reject('No user');
      }
      savedUser = user;
      var err = null;
      if (!req.body.password) {
        err = new ValidationError('Validation error', [
          new ValidationErrorItem('You must provide a new password', 'blank', 'password', '')
        ]);
        return promise.reject(err);
      }
      if (req.body.password !== req.body.confirmpassword) {
        err = new ValidationError('Validation error', [
          new ValidationErrorItem('The typed passwords don\'t match', 'confirm', 'password', '')
        ]);
        return promise.reject(err);
      }
      
      user.password = req.body.password;
      return user.save();
    }).then(function () {
      req.flash('success', 'Password successfully changed');
      return savedToken.destroy();
    }).then(function () {
      res.redirect('/signin');
    }).catch(function (err) {
      if (err.name === 'SequelizeValidationError') {
        res.render('auth/newpassword', {
          title: 'Change password',
          user: savedUser,
          usedemail: req.query.email,
          validate: err.errors
        });
      }
      req.flash('error', 'Invalid request');
      res.redirect('/signin');
    });
  });
  
  var createAuth = function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.session.referrer = '/password/create';
    res.redirect('/signin');
  }
  
  router.get('/password/create', createAuth, sendflash, function (req, res) {
    var validate = req.flash('valerror');
    res.render('auth/createpass', {
      title: 'Create password',
      section: 'createpass',
      validate: validate[0] ? validate[0].errors : []
    });
  });

  router.post('/password/create', createAuth, function (req, res, next) {
    var err = false;
    if (req.body.password !== req.body.passwordConfirm) {
      err = new ValidationError('Validation error', [
        new ValidationErrorItem('The password does not match the confirmation', 'confirm', 'passwordConfirm', '')
      ]);
    }

    if (err) {
      req.flash('error', 'There are invalid values');
      req.flash('valerror', err);
      return res.redirect('back');
    } else {
      req.user.password = req.body.password;
    }
    req.user.save().then(function () {
      req.flash('success', 'Password created');
      if (req.session.referrer) {
        res.redirect(req.session.referrer);
      } else {
        res.redirect('/dashboard');
      }
    }).catch(function (err) {
      if (err.message === 'Validation error') {
        req.flash('error', 'There are invalid values');
        req.flash('valerror', err);
        return res.redirect('back');
      }
      next(err);
    });
  });

 // AUTH ROUTES
  
  var authFunction = function (strategy, req, res, next) {
    passport.authenticate(strategy, function (err, user) {
      if (err) {
        return next(err);
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
  
  router.post('/auth/signup', function (req, res, next) {
    authFunction('local-signup', req, res, next);
  });
  
  router.post('/auth/signin', function (req, res, next) {
    authFunction('local-signin', req, res, next);
  });
 
  router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
  
  router.get('/auth/facebook/callback', function (req, res, next) {
    authFunction('facebook', req, res, next);
  });
  
  router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  // the callback after google has authenticated the user
  router.get('/auth/google/callback', function (req, res, next) {
    authFunction('google', req, res, next);
  });
  
  
  router.get('/auth/linkedin', passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
  
  // the callback after linkedin has authenticated the user
  router.get('/auth/linkedin/callback', function (req, res, next) {
    authFunction('linkedin', req, res, next);
  });
  
  router.get('/auth/wordpress', passport.authenticate('wordpress', { scope: ['auth'] }));
  
  // the callback after wordpress has authenticated the user
  router.get('/auth/wordpress/callback', function (req, res, next) {
    authFunction('wordpress', req, res, next);
  });
 
 // CONNECT ROUTES
  
  // facebook -------------------------------
  
  // send to facebook to do the authentication
  router.get('/connect/facebook', islogged, passport.authorize('facebook', { scope: 'email' }));
  
  // handle the callback after facebook has authorized the user
  router.get('/connect/facebook/callback', islogged,
passport.authorize('facebook', {
    successRedirect: '/account',
    failureRedirect: '/signin'
  }));
  
  
  // google ---------------------------------
  
  // send to google to do the authentication
  router.get('/connect/google', islogged, passport.authorize('google', { scope: ['profile', 'email'] }));
  
  // the callback after google has authorized the user
  router.get('/connect/google/callback', islogged,
passport.authorize('google', {
    successRedirect: '/account',
    failureRedirect: '/signin'
  }));
  
  // linkedin ---------------------------------
  
  // send to linkedin to do the authentication
  router.get('/connect/linkedin', islogged, passport.authorize('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
  
  // the callback after google has authorized the user
  router.get('/connect/linkedin/callback', islogged,
passport.authorize('linkedin', {
    successRedirect: '/account',
    failureRedirect: '/signin'
  }));
  
  
  // wordpress ---------------------------------
  
  // send to wordpress to do the authentication
  router.get('/connect/wordpress', islogged, passport.authorize('wordpress', { scope: ['auth'] }));
  
  // handle the callback after facebook has authorized the user
  router.get('/connect/wordpress/callback', islogged,
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
  router.get('/unlink/facebook', islogged, function (req, res) {
    var user = req.user;
    user.facebookToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  // google ---------------------------------
  router.get('/unlink/google', islogged, function (req, res) {
    var user = req.user;
    user.googleToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  // linkedin ---------------------------------
  router.get('/unlink/linkedin', islogged, function (req, res) {
    var user = req.user;
    user.linkedinToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  // wordpress ---------------------------------
  router.get('/unlink/wordpress', islogged, function (req, res) {
    var user = req.user;
    user.wordpressToken = null;
    user.save().then(function () {
      res.redirect('/account');
    });
  });
  
  return router;
};