var router = require('express').Router(),
  promise = require('sequelize').Promise,
  islogged = require('../utils/middlewares/islogged'),
  isactivated = require('../utils/middlewares/isactivated'),
  sendflash = require('../utils/middlewares/sendflash'),
  models = require('../models');

router.get('/', sendflash, function (req, res, next) {
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
        required: false
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

router.get('/new', isactivated, sendflash, function (req, res) {
  var validate = req.flash('valerror');
  var values = req.flash('values');
  res.render('feedback/form', {
    title: 'New feedback',
    section: 'feedbackform',
    types: ['Bug', 'Suggestion', 'Feedback'],
    validate: validate.length > 0 ? validate[0].errors : [],
    feedback: values.length > 0 ? values[0] : {}
  });
});

router.post('/new', isactivated, function (req, res, next) {
  models.Feedback.create({
    authorId: req.user.id,
    summary: req.body.summary,
    description: req.body.description,
    type: req.body.type
  }).then(function () {
    req.flash('success', 'The feedback "' + req.body.summary + '" was successfully created.');
    return res.redirect('/feedback/mine');
  }).catch(function (err) {
    if (err.name === 'SequelizeValidationError') {
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

module.exports = router;