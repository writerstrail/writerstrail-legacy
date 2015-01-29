module.exports = function isverified(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.referrer = req.originalUrl;
    var err = new Error('Not found');
    err.status = 404;
    next(err);
  } else if (req.user.verified) {
    next();
  } else {
    req.flash('error', req.__('You can\'t create or edit any content without a confirmed email address.'));
    res.redirect('/account');
  }
};