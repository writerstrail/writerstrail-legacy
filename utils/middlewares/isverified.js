module.exports = function isverified(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.referrer = req.originalUrl;
    res.redirect('/signin');
  } else if (!req.user.verified) {
    req.flash('error', req.__('You can\'t create or edit any content without a confirmed email address.'));
    res.redirect('/account');
  } else {
    next();
  }
};