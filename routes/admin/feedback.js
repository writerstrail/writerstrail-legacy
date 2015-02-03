var router = require('express').Router(),
  _ = require('lodash'),
  models = require('../../models'),
  sendflash = require('../../utils/middlewares/sendflash'),
  stati = require('../../utils/data/feedbackstati'),
  types = require('../../utils/data/feedbacktypes');

router.get('/', function (req, res, next) {
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
        'status',
        'deletedAt',
        models.Sequelize.literal('SUM(`votes`.`vote`) AS totalVotes')
      ],
      group: 'Feedback.id',
      order: [
        ['deletedAt', 'ASC']
      ]
    };
  if (_.includes(stati.concat(['All']), req.query.status)) {
    if (req.query.status !== 'All') {
      filters.push('Only feedbacks with status "' + req.query.status + '"are shown.');
      config.where.push ({
        status: req.query.status
      });
    }
  } else if (!req.query.all) {
    filters.push('Only new feedbacks are shown.');
    config.where.push ({
      status: 'New'
    });
  }
  if (req.query.deleted) {
    filters.push('Including deleted feedbacks.');
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
  }).then(function (feedbacks) {
    res.render('admin/feedback/list', {
      title: 'Admin feedback list',
      section: 'adminfeedback',
      filters: filters,
      feedbacks: feedbacks,
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
    res.render('admin/feedback/single', {
      title: feedback.type,
      feedback: feedback,
      types: types,
      stati: stati
    });
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;