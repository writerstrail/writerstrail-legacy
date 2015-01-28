// Gets sendgrid instance

var env = process.env.NODE_ENV || 'development',
  config = require('../../config/config.js')[env],
  sendgrid = require('sendgrid')(config.sendgrid.user, config.sendgrid.key);

module.exports = sendgrid;