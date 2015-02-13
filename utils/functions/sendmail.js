// Send general mail

var sendgrid = require('./getsendgrid');

module.exports = function sendmail(to, subject, body, template, sub, done) {
  console.log('---mail', to);
  
  var email = new sendgrid.Email({
    from: 'writerstrail@georgemarques.com.br',
    fromname: "Writer's Trail",
    subject: subject,
    html: body,
    smtpapi: new sendgrid.smtpapi({
      to: to.addresses,
      toname: to.names,
      filters: {
        templates: {
          settings: {
            enabled: 1,
            "template_id": template
          }
        }
      },
      sub: sub
    })
  });
  
  sendgrid.send(email, done);
};