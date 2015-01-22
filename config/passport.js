var models = require('../models');
var config = require('./config.js')[process.env.NODE_ENV || "development"];
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedinStrategy = require('passport-linkedin').Strategy;
var WordpressStrategy = require('passport-wordpress').Strategy;

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
		models.User.find({
          where: {
            id: id
          },
          include: [{
            model: models.Settings,
            as: 'settings'
          }]
        }).complete(function (err, user) {
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
			models.User.find({
				where: models.Sequelize.or(
					{ "facebookId": profile.id }, 
					{ "email": { like: profile.emails[0].value } },
					{ "googleEmail": { like: profile.emails[0].value } },
					{ "linkedinEmail": { like: profile.emails[0].value } },
					{ "wordpressEmail": { like: profile.emails[0].value } }
				)
			}).complete(function (err, user) {
				if (err) return done(err);
				
				if (user) {
					if (!user.facebookToken) {
						user.set("facebookId", profile.id);
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
					newUser.set("email", profile.emails[0].value);
					newUser.set("facebookEmail", profile.emails[0].value);
					
					newUser.save().complete(function (err) {
						if (err) return done(err);
						return done(null, newUser);
					});
				}

			});
		}
		else {
			models.User.find({
				where: models.Sequelize.or(
					{ "facebookId": profile.id }, 
					{ "email": { like: profile.emails[0].value } },
					{ "googleEmail": { like: profile.emails[0].value } },
					{ "linkedinEmail": { like: profile.emails[0].value } },
					{ "wordpressEmail": { like: profile.emails[0].value } }
				)
			}).complete(function (err, exuser) {
				if (err) return done(err);
				
				if (!exuser || (exuser.email == req.user.email)) {
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
	
	passport.use('google', new GoogleStrategy({
		clientID    : config.google.appid,
		clientSecret: config.google.secret,
		callbackURL : config.google.callback,
		passReqToCallback: true
	}, function (req, token, tokenSecret, profile, done) {
		if (!req.user) {
			models.User.find({
				where: models.Sequelize.or(
					{ "googleId": profile.id }, 
					{ "email": { like: profile.emails[0].value } },
					{ "facebookEmail": { like: profile.emails[0].value } },
					{ "linkedinEmail": { like: profile.emails[0].value } },
					{ "wordpressEmail": { like: profile.emails[0].value } }
				)
			}).complete(function (err, user) {
				if (err) return done(err);
				
				if (user) {
					if (!user.googleToken) {
						user.set("googleId", profile.id);
						user.set("googleToken", token);
						user.set("googleName", profile.displayName);
						user.set("googleEmail", profile.emails[0].value);
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
					newUser.set("googleId", profile.id);
					newUser.set("googleToken", token);
					newUser.set("googleName", profile.displayName);
					newUser.set("name", profile.displayName);
					newUser.set("email", profile.emails[0].value);
					newUser.set("googleEmail", profile.emails[0].value);
					
					newUser.save().complete(function (err) {
						if (err) return done(err);
						return done(null, newUser);
					});
				}

			});
		}
		else {
			models.User.find({
				where: models.Sequelize.or(
					{ "googleId": profile.id }, 
					{ "email": { like: profile.emails[0].value } },
					{ "facebookEmail": { like: profile.emails[0].value } },
					{ "linkedinEmail": { like: profile.emails[0].value } },
					{ "wordpressEmail": { like: profile.emails[0].value } }
				)
			}).complete(function (err, exuser) {
				if (err) return done(err);
				
				if (!exuser || (exuser.email == req.user.email)) {
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
	
	passport.use('linkedin', new LinkedinStrategy({
		consumerKey    : config.linkedin.appid,
		consumerSecret: config.linkedin.secret,
		callbackURL : config.linkedin.callback,
		profileFields: ['id', 'first-name', 'last-name', 'email-address'],
		passReqToCallback: true
	}, function (req, token, tokenSecret, profile, done) {
		if (!req.user) {
			models.User.find({
				where: models.Sequelize.or(
					{ "linkedinId": profile.id }, 
					{ "email": { like: profile.emails[0].value } },
					{ "facebookEmail": { like: profile.emails[0].value } },
					{ "googleEmail": { like: profile.emails[0].value } },
					{ "wordpressEmail": { like: profile.emails[0].value } }
				)
			}).complete(function (err, user) {
				if (err) return done(err);
				
				if (user) {
					if (!user.linkedinToken) {
						user.set("linkedinId", profile.id);
						user.set("linkedinToken", token);
						user.set("linkedinName", profile.name.givenName + ' ' + profile.name.familyName);
						user.set("linkedinEmail", profile.emails[0].value);
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
					newUser.set("linkedinId", profile.id);
					newUser.set("linkedinToken", token);
					newUser.set("linkedinName", profile.name.givenName + ' ' + profile.name.familyName);
					newUser.set("name", profile.name.givenName + ' ' + profile.name.familyName);
					newUser.set("email", profile.emails[0].value);
					newUser.set("linkedinEmail", profile.emails[0].value);
					
					newUser.save().complete(function (err) {
						if (err) return done(err);
						return done(null, newUser);
					});
				}

			});
		}
		else {
			models.User.find({
				where: models.Sequelize.or(
					{ "linkedinId": profile.id }, 
					{ "email": { like: profile.emails[0].value } },
					{ "facebookEmail": { like: profile.emails[0].value } },
					{ "googleEmail": { like: profile.emails[0].value } },
					{ "wordpressEmail": { like: profile.emails[0].value } }
				)
			}).complete(function (err, exuser) {
				if (err) return done(err);
				
				if (!exuser || (exuser.email == req.user.email)) {
					var user = req.user;
					user.set("linkedinId", profile.id);
					user.set("linkedinToken", token);
					user.set("linkedinName", profile.name.givenName + ' ' + profile.name.familyName);
					user.set("linkedinEmail", profile.emails[0].value);
					
					user.save().complete(function (err) {
						if (err) return done(err);
						return done(null, user);
					});
				} else {
					req.flash('error', req.__('This LinkedIn account is associated with another user'));
					done(null, req.user);
				}
			});
		}
	}));
	
	passport.use('wordpress', new WordpressStrategy({
		clientID    : config.wordpress.appid,
		clientSecret: config.wordpress.secret,
		callbackURL : config.wordpress.callback,
		passReqToCallback: true
	}, function (req, token, tokenSecret, profile, done) {
		console.log('profile', profile);
		if (!req.user) {
			models.User.find({
				where: models.Sequelize.or(
					{ "wordpressId": profile._json.ID }, 
					{ "email": { like: profile._json.email } },
					{ "facebookEmail": { like: profile._json.email } },
					{ "googleEmail": { like: profile._json.email } },
					{ "linkedinEmail": { like: profile._json.email } }
				)
			}).complete(function (err, user) {
				if (err) return done(err);
				
				if (user) {
					if (!user.linkedinToken) {
						user.set("wordpressId", profile._json.ID);
						user.set("wordpressToken", token);
						user.set("wordpressName", profile._json.display_name);
						user.set("wordpressEmail", profile._json.email);
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
					newUser.set("wordpressId", profile._json.ID);
					newUser.set("wordpressToken", token);
					newUser.set("wordpressName", profile._json.display_name);
					newUser.set("wordpressEmail", profile._json.email);
					newUser.set("name", profile._json.display_name);
					newUser.set("email", profile._json.email);
					
					newUser.save().complete(function (err) {
						if (err) return done(err);
						return done(null, newUser);
					});
				}

			});
		}
		else {
			models.User.find({
				where: models.Sequelize.or(
					{ "wordpressId": profile._json.ID }, 
					{ "email": { like: profile._json.email } },
					{ "facebookEmail": { like: profile._json.email } },
					{ "googleEmail": { like: profile._json.email } },
					{ "linkedinEmail": { like: profile._json.email } }
				)
			}).complete(function (err, exuser) {
				if (err) return done(err);
				
				if (!exuser || (exuser.email == req.user.email)) {
					var user = req.user;
					user.set("wordpressId", profile._json.ID);
					user.set("wordpressToken", token);
					user.set("wordpressName", profile._json.display_name);
					user.set("wordpressEmail", profile._json.email);
					
					user.save().complete(function (err) {
						if (err) return done(err);
						return done(null, user);
					});
				} else {
					req.flash('error', req.__('This Wordpress account is associated with another user'));
					done(null, req.user);
				}
			});
		}
	}));
};