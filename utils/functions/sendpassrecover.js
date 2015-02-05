// Send link to recover password

var sendgrid = require('./getsendgrid'),
  moment = require('moment'),
  models = require('../../models'),
  randomstring = require('randomstring'),
  config = require('../../config/config')[process.env.NODE_ENV || 'development'];

module.exports = function sendpassrecover(user, usedemail, done) {
  var string = randomstring.generate(40);
  
  var link = config.baseurl + '/password/recover/' + string + '?email=' + usedemail,
    email = new sendgrid.Email({
      to: usedemail,
      toname: user.name,
      from: 'writerstrail@georgemarques.com.br',
      fromname: "Writer's Trail",
      subject: 'Recover your password for Writer\'s Trail',
      html: user.email,
      smtpapi: new sendgrid.smtpapi({
        filters: {
          templates: {
            settings: {
              enabled: 1,
              "template_id": '2958c0c2-34b8-4c3e-8c59-4a07105e2742'
            }
          }
        },
        sub: {
          ":reclink": [link]
        }
      })
    });
  
  models.Token.destroy({
    where: {
      ownerId: user.id,
      type: 'password'
    }
  }).then(function () {
    return models.Token.create({
      ownerId: user.id,
      type: 'password',
      expire: moment().add(2, 'hours').toDate(),
      token: string,
      data: usedemail
    });
  }).then(function () {
    sendgrid.send(email, done);
  }).catch(function (err) {
    done(err);
  });
};