var models = require('../models');
var config = require('./config.js')[process.env.NODE_ENV || "development"];
var FacebookStrategy = require('passport-facebook');

module.exports = function passportConfig (passport) {
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
		callbackURL : config.facebook.callback
	}, function (token, refreshToken, profile, done) {
		models.User.find({ where: { facebookId: profile.id } }).complete(function (err, user) {
			if (err) return done(err);
			
			if (user) {
				return done(null, user)
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
	}));
};

