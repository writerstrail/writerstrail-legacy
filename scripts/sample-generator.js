var models = require('../models'),
    userData = {
      id: 2147483647,
      name: 'Sample user',
      email: 'sampleuser@example.com',
      verifiedEmail: 'sampleuser@example.com',
      password: 'sampleuserpass',
      activated: true,
      verified: true,
      lastAccess: new Date()
    },
    user;

models.User.destroy({
  where: {
    email: userData.email
  },
  force: true
}).then(function () {
  return models.User.create(userData);
}).then(function () {
  return models.User.findOne({
    where: {
      email: userData.email
    }
  });
}).then(function (u) {
  user = u;
  console.log(user);
});
