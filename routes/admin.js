var router = require('express').Router(),
  querystring = require('querystring'),
  models = require('../models'),
  _ = require('lodash'),
  feedbackRoutes = require('./admin/feedback'),
  mailRoutes = require('./admin/mail'),
  periodRoutes = require('./admin/periods');

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    var err = new Error();
    err.message = 'Not found';
    err.status = 404;
    next(err);
  }
}

router.use('*', isAdmin);

router.get('/', function (req, res, next) {
  models.Invitation.findAll().complete(function (err, codes) {
    if (err) { return next(err); }
    res.render('admin/index', {
      title: 'Administration',
      section: 'admin',
      codes: codes,
      errorMessage: req.flash('error'),
      successMessage: req.flash('success'),
      warningMessage: req.flash('warning')
    });
  });
});

router.get('/users', function (req, res, next) {
  var regex = /^\d+$/,
    filter = {
      limit: req.query.limit,
      deleted: req.query.deleted === 'true',
      orderby: req.query.orderby,
      orderdir: req.query.orderdir,
      page: 1
    };
  if (regex.test(req.query.page)) {
    filter.page = Math.max(1, parseInt(req.query.page));
  }
  
  if (!_.contains(['id', 'name', 'createdAt', 'lastAccess', 'invitationCode', 'verified', 'activated'], filter.orderby)) {
    filter.orderby = 'createdAt';
  }
  if (!_.contains(['ASC', 'DESC'], filter.orderdir)) {
    filter.orderdir = 'DESC';
  }
  
  models.User.findAndCount({
    limit: filter.limit,
    offset: (filter.page - 1) * filter.limit,
    order: [[filter.orderby, filter.orderdir]],
    paranoid: !filter.deleted
  }).success(function (result) {
    var totalPages = Math.ceil(result.count / filter.limit);
    
    if (filter.page > totalPages) {
      var newFilter = _.clone(filter),
        query;

      newFilter.page = totalPages;

      query = querystring.stringify(newFilter);

      return res.redirect('/admin/users?' + query);
    }
    
    res.locals.roleName = function (role) {
      switch (role) {
        case 'user': {
          return req.__('User');
        }
        case 'moderator': {
          return req.__('Moderator');
        }
        case 'admin': {
          return req.__('Administrator');
        }
        case 'superadmin': {
          return req.__('God-like being');
        }
        default: {
          return req.__('Unknown entity');
        }
      }
    };
    
    var actlist = null;
    if (req.session.actusers) {
      actlist = req.session.actusers;
      delete req.session.actusers;
    }
    
    res.render('admin/users', {
      title: 'User administration',
      section: 'adminusers',
      page: filter.page,
      totalPages: totalPages,
      users: result.rows,
      deleted: filter.deleted,
      orderby: filter.orderby === 'createdAt' ? null : filter.orderby,
      orderdir: filter.orderdir === 'DESC' ? null : filter.orderdir,
      actlist: actlist,
      successMessage: req.flash('success'),
      errorMessage: req.flash('error'),
      warningMessage: req.flash('warning')
    });
  }).error(function (err) {
    next(err);
  });
});

router.post('/users/callnext', function (req, res) {
  if (req.body.activatenext) {
    models.User.findAll({
      where: {
        activated: false
      },
      order: [['createdAt', 'DESC']],
      limit: Math.max(1, parseInt(req.body.amount))
    }).complete(function (err, rows) {
      if (err) {
        req.flash('error', req.__('There was an error searching the users'));
      } else if (rows.length === 0) {
        req.flash('warning', req.__('No user found to activate'));
      } else {
        req.session.actusers = rows;
        
        _.each(rows, function (row) {
          row.set('activated', true);
          row.save();
        });
        
        req.flash('success', req.__('Users activated. Don\'t forget to warn them by email'));
      }
      res.redirect('back');
    });
  } else {
    res.redirect('back');
  }
});

router.get(/\/user\/(\d+)/, function (req, res) {
  models.User.findOne({
    where: {
      id: req.params[0]
    },
    paranoid: false
  }).complete(function (err, user) {
    res.render('admin/edit', {
      title: req.__('Edit user'),
      section: 'adminuseredit',
      u: user,
      errorMessage: req.flash('error'),
      successMessage: req.flash('success'),
      warningMessage: req.flash('warning')
    });
  });
});

router.post(/\/user\/(\d+)/, function (req, res) {
  var userid = parseInt(req.params[0]);
  var update = {
    name: req.body.name,
    activated: !!req.body.activated,
    verified: !!req.body.verified,
    email: req.body.email,
    verifiedEmail: req.body.verifiedEmail,
    invitationCode: req.body.invitationCode || null,
    facebookId: req.body.facebookId || null,
    facebookToken: req.body.facebookToken || null,
    facebookName: req.body.facebookName || null,
    facebookEmail: req.body.facebookEmail || null,
    googleId: req.body.googleId || null,
    googleToken: req.body.googleToken || null,
    googleName: req.body.googleName || null,
    googleEmail: req.body.googleEmail || null,
    linkedinId: req.body.linkedinId || null,
    linkedinToken: req.body.linkedinToken || null,
    linkedinName: req.body.linkedinName || null,
    linkedinEmail: req.body.linkedinEmail || null,
    wordpressId: req.body.wordpressId || null,
    wordpressToken: req.body.wordpressToken || null,
    wordpressName: req.body.wordpressName || null,
    wordpressEmail: req.body.wordpressEmail || null
  };
  
  // change role only if other user
  if (req.user.id !== userid) {
    update.role = req.body.role;
  }
  
  models.User.update(update, {
    where: {
      id: userid,
      createdAt: new Date(parseInt(req.body.createdAt))
    },
    paranoid: false
  }).complete(function (err) {
    if (err) {
      req.flash('error', req.__('There was an error saving the user'));
    } else {
      req.flash('success', req.__('User successfully updated'));
    }
    res.redirect('back');
  });

});

router.post('/invitation', function (req, res) {
  models.Invitation.findOrCreate({
    where: { code: req.body.invCode },
    defaults: {
      code: req.body.invCode,
      amount: req.body.invAmount
    }
  })
   .then(function (params) {
    var inv = params[0];
    var created = params[1];
    if (!inv) {
      req.flash('error', 'There was an error saving the invitation'); 
    } else {
      if (!created) {
        inv.increment('amount', { by: req.body.invAmount }).then(function () {
          req.flash('success', 'The invitation was successfully saved');
          res.redirect('/admin');
        });
      } else {
        req.flash('success', 'The invitation was successfully saved');
        res.redirect('/admin');
      }
    }
  }).catch(function () {
    req.flash('error', 'There was an error saving the invitation');
    res.redirect('/admin');
  });
});

router.post('/deleteinvitation', function (req, res) {
  models.Invitation.find({
    where: {
      id: parseInt(req.body.invId)
    }
  }).complete(function (err, inv) {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/admin');
    } else {
      inv.destroy().then(function () {
        req.flash('success', 'The invitation was successfully deleted');
        res.redirect('/admin');
      });
    }
  });
});

router.post('/maintenance', function (req, res) {
  models.App.update({
    maintenance: req.body.maintenance,
    sysmsg: req.body.sysmsg || null
  }, {
    where: { id: 1 }
  }).then(function (rows) {
    if (rows > 0) {
      req.flash('success', 'Maintenance mode changed to "' + req.body.maintenance + '".');
    } else {
      req.flash('error', 'No row updated from maintenance mode change.');
    }
  }).catch(function (err) {
    req.flash('error', 'Error: ' + err.message);
  }).finally(function () {
    res.redirect('back');
  });
});

router.post('/user/edit', function (req, res, next) {
  if (req.body.activate) {
    models.User.findOne({
      where: {
        id: parseInt(req.body.activate)
      },
      paranoid: false
    }).complete(function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        req.flash('error', req.__('No user with id %s', req.body.activate));
        return res.redirect('back');
      } else {
        user.activated = !user.activated;
        user.save().complete(function (err) {
          if (err) {
            req.flash('error', req.__('There was an error saving the user'));
          } else {
            req.flash('success', req.__('User successfully %s', user.activated ? req.__('activated') : req.__('deactivated')));
          }
          return res.redirect('back');
        });
      }
    });
  } else if (req.body.delete) {
    if (req.user.id == req.body.delete) {
      req.flash('error', req.__('You can\'t delete yourself'));
      return res.redirect('back');
    }
    models.User.destroy({
      where: {
        id: req.body.delete
      }
    }).complete(function (err) {
      if (err) {
        req.flash('error', req.__('There was an error deleting the user'));
      } else {
        req.flash('success', req.__('User successfully deleted'));
      }
      return res.redirect('back');
    });
  } else if (req.body.undelete) {
    models.User.restore({
      where: {
        id: parseInt(req.body.undelete)
      }
    }).complete(function (err) {
      if (err) {
        req.flash('error', req.__('There was an error restoring the user'));
      } else {
        req.flash('success', req.__('User successfully restored'));
      }
      res.redirect('back');
    });
  } else if (req.body.bulkActivate === 'true' || req.body.bulkDeactivate === 'true') {
    if (!req.body.selected || req.body.selected.length === 0) {
      req.flash('warning', req.__('No selected users'));
      return res.redirect('back');
    }
    models.User.update({
      activated: (req.body.bulkActivate === 'true') || false
    }, {
      where: {
        id: req.body.selected
      }
    }).complete(function (err) {
      if (err) {
        req.flash('error', req.__('There was an error %s the users', (req.body.bulkActivate ? req.__('activating') : req.__('deactivating'))));
      } else {
        req.flash('success', req.__('Users successfully %s', (req.body.bulkActivate ? req.__('activated') : req.__('deactivated'))));
      }
      res.redirect('back');
    });
  } else if (req.body.bulkDelete === 'true') {
    if (!req.body.selected || req.body.selected.length === 0) {
      req.flash('warning', req.__('No selected users'));
      return res.redirect('back');
    }
    _.remove(req.body.selected, function (value) {
      return req.user.id == value;
    });
    models.User.destroy({
      where: {
        id: req.body.selected
      }
    }).complete(function (err) {
      if (err) {
        req.flash('error', req.__('There was an error deleting the users'));
      } else {
        req.flash('success', req.__('Users successfully deleted'));
      }
      return res.redirect('back');
    });
  } else if (req.body.bulkRestore === 'true') {
    if (!req.body.selected || req.body.selected.length === 0) {
      req.flash('warning', req.__('No selected users'));
      return res.redirect('back');
    }
    models.User.restore({
      where: {
        id: req.body.selected
      }
    }).complete(function (err) {
      if (err) {
        req.flash('error', req.__('There was an error restoring the users'));
      } else {
        req.flash('success', req.__('Users successfully restored'));
      }
      return res.redirect('back');
    });
  } else {
    res.redirect('back');
  }
});

router.use('/login/:id', function (req, res, next) {
  models.User.findOne({
    where: {
      id: req.params.id
    }
  }).then(function (user) {
    if (!user) {
      req.flash('error', req.__('No user with id %s', req.params.id));
      return res.redirect('/admin/users');
    }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      res.redirect('/dashboard');
    });
  }).catch(function (err) {
    next(err);
  });
});


router.use('/feedback', feedbackRoutes);
router.use('/mail', mailRoutes);
router.use('/periods', periodRoutes);

module.exports = router;
