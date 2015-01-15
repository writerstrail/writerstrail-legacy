module.exports = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	
	req.session.referer = req.originalUrl;
	res.redirect('/signin');
};