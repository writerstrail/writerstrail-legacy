var router = require("express").Router(),
  _ = require('lodash'),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  templates = require('../../utils/data/admin/sgtemplates'),
  sendmail = require('../../utils/functions/sendmail');

router.get('/', sendflash, function (req, res) {
  models.User.findAll().then(function (users) {
    res.render('admin/mail', {
      title: 'Mail',
      section: 'adminmail',
      users: users,
      templates: templates
    });
  });
});

router.post('/', function (req, res) {
  models.User.findAll({
    where: {
      id: {
        in: [req.body.users]
      }
    }
  }).then(function (users) {
    console.log(users);
    var to = { addresses: [], names: [] };
    _.forEach(users, function (user) {
      to.addresses.push(user.email);
      to.names.push(user.name);
    });
    sendmail(to, req.body.subject, req.body.body, req.body.template, {
      ':username': to.names
    }, function (err) {
      if (err) {
        req.flash('error', 'There was an error sending the mail.');
      } else {
        req.flash('success', 'Mail successfully sent.');
      }
      res.redirect('back');
    });
  }).catch(function (err) {
    console.log('mail db error:', err);
    req.flash('error', 'There was a database error.');
    res.redirect('back');
  });
});

module.exports = router;