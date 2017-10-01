// Http -> Https redirection middleware
module.exports = function tosecure(req, res, next) {
  if (req.headers['x-forwarded-proto'] === 'http') {
    var tmp = 'https://' + req.headers.host + req.originalUrl;
    res.redirect(tmp);
  } else {
    return next();
  }
};
