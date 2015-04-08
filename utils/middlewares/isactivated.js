module.exports = function isactivated(req, res, next) {
  if (!req.user || req.user.id < 0) {
    req.session.referrer = req.originalUrl;
    res.redirect('/signin');
  } else if (req.user.password === null) {
    res.redirect('/password/create');
  } else if (!req.user.activated) {
    req.flash('error', req.__('Sorry, your account is still not activated. You can activate your account now if you have an invitation code for beta.'));
    res.redirect('/account');
  } else {
    next();
  }
};