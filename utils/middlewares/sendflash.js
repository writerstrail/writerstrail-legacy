module.exports = function sendflash(req, res, next) {
  res.locals.errorMessage = req.flash('error');
  res.locals.successMessage = req.flash('success');
  res.locals.warningMessage = req.flash('warning');
  res.locals.maintenanceMessage = req.flash('maintenance');
  res.locals.isSendingFlash = true;
  next();
};