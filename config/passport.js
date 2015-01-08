var models = require('../models');
var config = require('./config.js')[process.env.NODE_ENV || "development"];
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

function updateUserLastAccess(userId) {
	models.User.update({
		lastAccess: new Date()
	}, {
		where: {
			id: userId
		}
	});
}

module.exports = function passportConfig(passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});
	
	// used to deserialize the user
	passport.deserializeUser(function (id, done) {
		models.User.find(id).complete(function (err, user) {
			done(err, user);
		});
	});
	
	passport.use('facebook', new FacebookStrategy({
		clientID    : config.facebook.appid,
		clientSecret: config.facebook.secret,
		callbackURL : config.facebook.callback,
		passReqToCallback: true
	}, function (req, token, refreshToken, profile, done) {
		if (!req.user) {
			models.User.find({ where: { "facebookId": profile.id } }).complete(function (err, user) {
				if (err) return done(err);
				
				if (user) {
					if (!user.facebookToken) {
						user.set("facebookToken", token);
						user.set("facebookName", profile.name.givenName + ' ' + profile.name.familyName);
						user.set("facebookEmail", profile.emails[0].value);
						user.set('lastAccess', new Date());
						user.save().complete(function (err) {
							if (err) return done(err);
							return done(null, user);
						});
					} else {
						updateUserLastAccess(user.id);
						return done(null, user);
					}
				} else {
					
					var newUser = models.User.build();
					newUser.set("facebookId", profile.id);
					newUser.set("facebookToken", token);
					newUser.set("facebookName", profile.name.givenName + ' ' + profile.name.familyName);
					newUser.set("name", profile.name.givenName + ' ' + profile.name.familyName);
					newUser.set("facebookEmail", profile.emails[0].value);
					
					newUser.save().complete(function (err) {
						if (err) return done(err);
						return done(null, newUser);
					});
				}

			});
		}
		else {
			models.User.find({ where: { "facebookId": profile.id } }).complete(function (err, exuser) {
				if (err) return done(err);
				
				if (!exuser) {
					var user = req.user;
					user.set("facebookId", profile.id);
					user.set("facebookToken", token);
					user.set("facebookName", profile.name.givenName + ' ' + profile.name.familyName);
					user.set("facebookEmail", profile.emails[0].value);
					
					user.save().complete(function (err) {
						if (err) return done(err);
						return done(null, user);
					});
				} else {
					req.flash('error', req.__('This Facebook account is associated with another user'));
					done(null, req.user);
				}
			});
		}
	}));
	
	passport.use('twitter', new TwitterStrategy({
		consumerKey: config.twitter.appid,
		consumerSecret: config.twitter.secret,
		callbackURL : config.twitter.callback,
		passReqToCallback: true
	}, function (req, token, tokenSecret, profile, done) {
		if (!req.user) {
			models.User.find({ where: { "twitterId": profile.id } }).complete(function (err, user) {
				if (err) return done(err);
				
				if (user) {
					if (!user.twitterToken) {
						user.set("twitterToken", token);
						user.set("twitterDisplayName", profile.displayName);
						user.set("twitterUsername", profile.username);
						user.set('lastAccess', new Date());
						
						user.save().complete(function (err) {
							if (err) return done(err);
							return done(null, user);
						});
					} else {
						updateUserLastAccess(user.id);
						return done(null, user);
					}
				} else {
					
					var newUser = models.User.build();
					newUser.set("twitterId", profile.id);
					newUser.set("twitterToken", token);
					newUser.set("twitterDisplayName", profile.displayName);
					newUser.set("name", profile.displayName);
					newUser.set("twitterUsername", profile.username);
					
					newUser.save().complete(function (err) {
						if (err) return done(err);
						return done(null, newUser);
					});
				}

			});
		} else {
			models.User.find({ where: { "twitterId": profile.id } }).complete(function (err, exuser) {
				if (err) return done(err);
				
				if (!exuser) {
					var user = req.user;
					user.set("twitterId", profile.id);
					user.set("twitterToken", token);
					user.set("twitterDisplayName", profile.displayName);
					user.set("twitterUsername", profile.username);
					
					user.save().complete(function (err) {
						if (err) return done(err);
						return done(null, user);
					});
				} else {
					req.flash('error', req.__('This Twitter account is associated with another user'));
					done(null, req.user);
				}
			});
		}
	}));
	
	passport.use('google', new GoogleStrategy({
		clientID    : config.google.appid,
		clientSecret: config.google.secret,
		callbackURL : config.google.callback,
		passReqToCallback: true
	}, function (req, token, tokenSecret, profile, done) {
		if (!req.user) {
			models.User.find({ where: { "googleId": profile.id } }).complete(function (err, user) {
				if (err) return done(err);
				
				if (user) {
					if (!user.googleToken) {
						user.set("googleToken", token);
						user.set("googleName", profile.displayName);
						user.set("googleEmail", profile.emails[0].value);
						user.set('lastAccess', new Date());
						
						user.save().complete(function (err) {
							if (err) return done(err);
							return done(null, newUser);
						});
					} else {
						updateUserLastAccess(user.id);
						return done(null, user);
					}
				} else {
					
					var newUser = models.User.build();
					newUser.set("googleId", profile.id);
					newUser.set("googleToken", token);
					newUser.set("googleName", profile.displayName);
					newUser.set("name", profile.displayName);
					newUser.set("googleEmail", profile.emails[0].value);
					
					newUser.save().complete(function (err) {
						if (err) return done(err);
						return done(null, newUser);
					});
				}

			});
		}
		else {
			models.User.find({ where: { "googleId": profile.id } }).complete(function (err, exuser) {
				if (err) return done(err);
				
				if (!exuser) {
					var user = req.user;
					user.set("googleId", profile.id);
					user.set("googleToken", token);
					user.set("googleName", profile.displayName);
					user.set("googleEmail", profile.emails[0].value);
					
					user.save().complete(function (err) {
						if (err) return done(err);
						return done(null, user);
					});
				} else {
					req.flash('error', req.__('This Google account is associated with another user'));
					done(null, req.user);
				}
			});
		}
	}));
};