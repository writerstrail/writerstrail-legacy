var router = require('express').Router(),
  promise = require('sequelize').Promise,
  islogged = require('../utils/middlewares/islogged'),
  isactivated = require('../utils/middlewares/isactivated'),
  models = require('../models');

router.get('/', function (req, res, next) {
  var userVotes = null;
  (function () {
    if (!req.user) {
      return promise.resolve(null);
    }
    return models.Vote.findAll({
      where: {
        voterId: req.user.id
      }
    });
  })().then(function (votes) {
    userVotes = votes;
    return models.Feedback.findAll({
      include: {
        model: models.Vote,
        as: 'votes',
        required: true
      },
      attributes: [
        'id',
        'summary',
        'type',
        models.Sequelize.literal('SUM(`votes`.`vote`) AS totalVotes')
      ],
      group: 'Feedback.id',
      order: [models.Sequelize.literal('totalVotes DESC')]
    }, {
      raw: true
    });
  }).then(function (feedbacks) {
    res.render('feedback/index', {
      title: 'Feedback list',
      section: 'feedback',
      feedbacks: feedbacks,
      votes: userVotes
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/new', isactivated, function (req, res) {
  res.render('feedback/form', {
    title: 'New feedback',
    section: 'feedbackform',
    types: ['Bug', 'Suggestion', 'Feedback']
  });
});

module.exports = router;