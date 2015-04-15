var router = require('express').Router(),
  _ = require('lodash'),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  stati = require('../../utils/data/feedbackstati'),
  types = require('../../utils/data/feedbacktypes');

router.get('/', sendflash, function (req, res, next) {
  var filters = [],
    config = {
      where: [],
      include: {
        model: models.Vote,
        as: 'votes',
        required: false
      },
      attributes: [
        'id',
        'summary',
        'type',
        'description',
        'status',
        'deletedAt',
        'response',
        models.Sequelize.literal('SUM(`votes`.`vote`) AS totalVotes')
      ],
      group: 'Feedback.id',
      order: [
        ['deletedAt', 'ASC']
      ]
    };
  if (_.includes(stati.concat(['All']), req.query.status)) {
    if (req.query.status !== 'All') {
      var statusSearch = req.query.status;
      filters.push('Only feedback with status "' + statusSearch + '" are shown.');
      config.where.push ({
        status: statusSearch
      });
    }
  }
  if (!req.query.status) {
    filters.push('Only feedback not completed nor dismissed are shown.');
    var orFilter = [];

    _.forEach(['New', 'Reviewing', 'Accepted', 'Developing'], function (s) {
      orFilter.push({ status: s });
    });
    config.where.push(models.Sequelize.or.apply(global, orFilter));
  }
  if (req.query.deleted) {
    filters.push('Including deleted feedback.');
    config.paranoid = false;
  }
  if (_.includes(['Votes', 'Creation'], req.query.order || null)) {
    filters.push('Ordering by "' + req.query.order + '".');
    
    if (req.query.order === 'Votes') {
      config.order.push(
        models.Sequelize.literal('`totalVotes` DESC'),
        ['createdAt', 'DESC']
      );
    } else {
      config.order.push(
        ['createdAt', 'DESC']
      );
    }
  } else {
    config.order.push(
      models.Sequelize.literal('`totalVotes` DESC'),
      ['createdAt', 'DESC']
    );
  }
  models.Feedback.findAll(config, {
    raw: true
  }).then(function (feedback) {
    res.render('admin/feedback/list', {
      title: 'Admin feedback list',
      section: 'adminfeedback',
      filters: filters,
      feedback: feedback,
      stati: stati,
      query: req.query
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/:id', sendflash, function (req, res, next) {
  models.Feedback.findOne({
    where: {
      id: req.params.id
    },
    include: {
      model: models.Vote,
      as: 'votes',
      required: false
    },
    attributes: [
      'id',
      'summary',
      'type',
      'authorId',
      'description',
      'originalAuthorId',
      'deletedAt',
      'status',
      'response',
      models.Sequelize.literal('SUM(`votes`.`vote`) AS totalVotes')
    ],
    paranoid: false
  }, {
    raw: true
  }).then(function (feedback) {
    if (!feedback.id) {
      var err = new Error('Not found');
      err.status = 404;
      return next(err);
    }
    var validate = req.flash('valerror');
    var values = req.flash('values');
    res.render('admin/feedback/single', {
      title: feedback.type,
      types: types,
      stati: stati,
      validate: validate.length > 0 ? validate[0].errors : [],
      feedback: values.length > 0 ? values[0] : feedback
    });
  }).catch(function (err) {
    next(err);
  });
});

router.post('/:id', sendflash, function (req, res, next) {
  var config = {
    summary: req.body.summary,
    type: req.body.type,
    description: req.body.description || null,
    status: req.body.status,
    response: req.body.response || null
  };
  // Permissoion to change lock
  if ((req.body.originalAuthorId === req.body.authorId) || (parseInt(req.body.authorId, 10) === req.user.id)) {
    config.authorId = !!req.body.lock ? req.user.id : req.body.originalAuthorId;
  }
  models.Feedback.update(config, {
    where: {
      id: req.params.id
    }
  }).then(function (rows) {
    if (rows > 0) {
      req.flash('success', 'Feedback successfully updated');
    } else {
      req.flash('warning', 'No row updated');
    }
    res.redirect('/admin/feedback');
  }).catch(function (err) {
    if (err.message === 'Validation error') {
      req.flash('error', 'There are invalid values');
      req.flash('valerror', err);
      req.flash('values', {
        summary: req.body.summary,
        description: req.body.description,
        type: req.body.type
      });
      res.redirect('back');
    } else {
      next(err);
    }
  });
});

router.get('/:id/delete', function (req, res, next) {
  models.Feedback.destroy({
    where: {
      id: req.params.id
    }
  }).then(function (rows) {
    if (rows > 0) {
      req.flash('success', 'Feedback successfully deleted.');
    } else {
      req.flash('warning', 'No feedback to delete.');
    }
    res.redirect('/admin/feedback/' + req.params.id);
  }).catch(function (err) {
    next(err);
  });
});

router.get('/:id/delete/undo', function (req, res, next) {
  models.Feedback.restore({
    where: {
      id: req.params.id
    }
  }).then(function (rows) {
    if (rows) {
      req.flash('success', 'Feedback successfully restored.');
    } else {
      req.flash('warning', 'No feedback to restore.');
    }
    res.redirect('/admin/feedback/' + req.params.id);
  }).catch(function (err) {
    next(err);
  });
});

router.get('/:id/delete/forever', function (req, res, next) {
  models.Feedback.destroy({
    where: {
      id: req.params.id
    },
    force: true
  }).then(function (rows) {
    if (rows > 0) {
      req.flash('success', 'Feedback successfully deleted forever.');
    } else {
      req.flash('warning', 'No feedback to delete forever.');
    }
    res.redirect('/admin/feedback');
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;
