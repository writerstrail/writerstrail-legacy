module.exports = function islogged(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.session.referrer = req.originalUrl;
  res.redirect('/signin');
};