var models = require('../models');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});
	
	// used to deserialize the user
	passport.deserializeUser(function (id, done) {
		models.User.find(id).complete(function (err, user) {
			done(err, user);
		});
	});
};