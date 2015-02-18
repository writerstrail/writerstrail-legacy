module.exports = function isactivated(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.referrer = req.originalUrl;
    res.redirect('/signin');
  } else if (req.user.password === null) {
    res.redirect('/password/create');
  } else if (!req.user.activated) {
    req.flash('error', req.__('Sorry, your account is still not activated.'));
    res.redirect('/account');
  } else {
    next();
  }
};