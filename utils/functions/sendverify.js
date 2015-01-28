// Send verify email to user

var sendgrid = require('./getsendgrid'),
  moment = require('moment'),
  models = require('../../models'),
  randomstring = require('randomstring'),
  config = require('../../config/config')[process.env.NODE_ENV || 'development'];

module.exports = function sendverify(user, done) {
  // Do not let verified user waste email
  if (user.verified) { return done (null, true); }
  
  var string = randomstring.generate(40);
  
  var link = config.baseurl + '/account/verify/' + string + '?email=' + user.email,
    email = new sendgrid.Email({
      to: user.email,
      toname: user.name,
      from: 'writerstrail@georgemarques.com.br',
      fromname: "Writer's Trail",
      subject: 'Verify your email for Writer\'s Trail',
      html: '<a href="' + link + '">Click here to verify your email</a>. Or follow the link: ' + link,
      smtpapi: new sendgrid.smtpapi({
        filters: {
          templates: {
            settings: {
              enabled: 1,
              "template_id": '1a8c6d97-d082-4347-adaf-4f4735d20a87'
            }
          }
        }
      })
    });
  
  models.Token.destroy({
    where: {
      ownerId: user.id,
      type: 'email'
    }
  }).then(function (){
    return models.Token.create({
      token: string,
      ownerId: user.id,
      type: 'email',
      data: user.email,
      expire: moment().add(48, 'hours').toDate()
    });
  }).then(function () {
    return user.save();
  }).then(function ()  {
    sendgrid.send(email, done);             
  }).catch(function (err) {
    done(err);
  });
};