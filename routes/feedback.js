var router = require('express').Router(),
  promise = require('sequelize').Promise,
  islogged = require('../utils/middlewares/islogged'),
  isverified = require('../utils/middlewares/isverified'),
  isactivated = require('../utils/middlewares/isactivated'),
  sendflash = require('../utils/middlewares/sendflash'),
  _ = require('lodash'),
  models = require('../models'),
  stati = require('../utils/data/feedbackstati'),
  types = require('../utils/data/feedbacktypes');

router.get('/', sendflash, function (req, res, next) {
  var userVotes = null,
    filters = [];
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
    var config = {
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
        'deletedAt',
        'status',
        'response',
        models.Sequelize.literal('SUM(`votes`.`vote`) AS totalVotes')
      ],
      group: 'Feedback.id',
      order: [
        ['deletedAt', 'ASC'],
        models.Sequelize.literal('totalVotes DESC')
      ]
    };
    
    if (_.includes(stati.concat(['All']), req.query.status)) {
      if (req.query.status !== 'All') {
        filters.push('Only feedbacks with status "' + req.query.status + '"are shown.');
        config.where.push ({
          status: req.query.status
        });
      }
    }
    if (req.query.deleted) {
      filters.push('Including deleted feedbacks.');
      config.paranoid = false;
    }
    
    return models.Feedback.findAll(config, {
      raw: true
    });
  }).then(function (feedbacks) {
    res.render('feedback/index', {
      title: 'Feedback list',
      section: 'feedback',
      feedbacks: feedbacks,
      votes: userVotes,
      filters: filters,
      stati: stati,
      query: {
        status: req.query.status,
        deleted: req.query.deleted
      }
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
    types: types,
    validate: validate.length > 0 ? validate[0].errors : [],
    feedback: values.length > 0 ? values[0] : {}
  });
});

router.post('/new', isactivated, isverified, function (req, res, next) {
  models.Feedback.create({
    authorId: req.user.id,
    originalAuthorId: req.user.id,
    summary: req.body.summary,
    description: req.body.description || null,
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

router.get('/mine', islogged, sendflash, function (req, res) {
  var filters = [],
    config = {
      where: [
        { originalAuthorId: req.user.id }
      ],
      order: [
        ['deletedAt', 'ASC'],
        ['createdAt', 'ASC']
      ]
    };
  if (_.includes(stati.concat(['All']), req.query.status)) {
    if (req.query.status !== 'All') {
      filters.push('Only feedbacks with status "' + req.query.status + '" are shown.');
      config.where.push ({
        status: req.query.status
      });
    }
  }
  if (req.query.deleted) {
    filters.push('Including deleted feedbacks.');
    config.paranoid = false;
  }
  models.Feedback.findAll(config).then(function (feedbacks) {
    res.render('feedback/mine', {
      title: 'Your feedbacks',
      feedbacks: feedbacks,
      filters: filters,
      stati: stati,
      query: req.query
    });
  });
});

router.get('/:id', sendflash, function (req, res, next) {
  var userVote = null;
  
  (function () {
    if (!req.user) {
      return promise.resolve(null);
    }
    return models.Vote.findOne({
      where: {
        voterId: req.user.id,
        feedbackId: req.params.id
      }
    });
  })().then(function (vote) {
    userVote = vote;
    return models.Feedback.findOne({
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
    });
  }).then(function (feedback) {
    if (!feedback.id) {
      var err = new Error('Not found');
      err.status = 404;
      return next(err);
    }
    res.render('feedback/single', {
      title: feedback.type,
      feedback: feedback,
      vote: userVote ? userVote.vote : 0
    });
  }).catch(function (err) {
    next(err);
  });
});

var vote = function (value, req, res, next) {
  models.Vote.findOrCreate({
    where: {
      voterId: req.user.id,
      feedbackId: req.params.id
    },
    defaults: {
      vote: value
    }
  }).then(function (result) {
    var vote = result[0],
      created = result[1];
    if (created) {
      return promise.resolve(vote);
    }
    return vote.updateAttributes({
      vote: value
    });
  }).then(function (vote) {
    if (vote) {
      req.flash('success', 'Feedback successfully voted');
    } else {
      req.flash('error', 'Something bad occurred. You may try again later.');
    }
    res.redirect('back');
  }).catch(function (err) {
    if (err.name !== 'SequelizeValidationError') {
      return next(err);
    }
    req.flash('error', 'There was something wrong with your request. Are you trying to vote twice?');
  });
};

var cancelVote = function (value, req, res, next) {
  models.Vote.destroy({
    where: {
      voterId: req.user.id,
      feedbackId: req.params.id,
      vote: value
    }
  }).then(function (vote) {
    if (vote > 0) {
      req.flash('success', 'Vote successfully canceled.');
    } else {
      req.flash('warning', 'There was no vote to cancel.');
    }
    res.redirect('back');
  }).catch(function (err) {
    next(err);
  });
};

router.get('/:id/upvote', islogged, isverified, function (req, res, next) {
  vote(1, req, res, next);
});

router.get('/:id/upvote/undo', islogged, isverified, function (req, res, next) {
  cancelVote(1, req, res, next);
});

router.get('/:id/downvote', islogged, isverified, function (req, res, next) {
  vote(-1, req, res, next);
});

router.get('/:id/downvote/undo', islogged, isverified, function (req, res, next) {
  cancelVote(-1, req, res, next);
});

router.get('/:id/delete', islogged, isverified, function (req, res, next) {
  models.Feedback.destroy({
    where: {
      authorId: req.user.id,
      id: req.params.id
    }
  }).then(function () {
    return models.Feedback.findOne({
       where: {
        authorId: req.user.id,
        id: req.params.id
      },
      paranoid: false
    });
  }).then(function (feedback) {
    if (!feedback) {
      var err = new Error('Not found');
      err.status = 404;
      return next(err);
    }
    res.render('feedback/delete', {
      title: feedback.type + ' deleted',
      feedback: feedback,
      successMessage: ['Feedback successfully deleted.']
    });
  }).catch(function (err) {
    next(err);
  });
});

router.get('/:id/delete/undo', islogged, isverified, function (req, res, next) {
  models.Feedback.restore({
    where: {
      id: req.params.id,
      authorId: req.user.id
    }
  }).then(function () {
    req.flash('success', 'Feedback successfully restored.');
    return res.redirect('/feedback/' + req.params.id);
  }).catch(function (err) {
    next(err);
  });
});

module.exports = router;