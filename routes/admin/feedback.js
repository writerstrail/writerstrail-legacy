var router = require('express').Router(),
  _ = require('lodash'),
  models = require('../../models'),
  stati = require('../../utils/data/feedbackstati');

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
        ['deletedAt', 'ASC'],
        models.Sequelize.literal('`totalVotes` DESC'),
        ['createdAt', 'DESC']
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
  models.Feedback.findAll(config, {
    raw: true
  }).then(function (feedbacks) {
    res.render('admin/feedback/list', {
      title: 'Admin feedback list',
      section: 'adminfeedback',
      filters: filters,
      feedbacks: feedbacks,
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

module.exports = router;