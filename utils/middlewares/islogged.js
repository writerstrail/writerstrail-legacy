module.exports = function islogged(req, res, next) {
  if (req.isAuthenticated() && req.user.password === null) {
    return res.redirect('/password/create');
  } else if (req.isAuthenticated()) {
    return next();
  }

  req.session.referrer = req.originalUrl;
  res.redirect('/signin');
};