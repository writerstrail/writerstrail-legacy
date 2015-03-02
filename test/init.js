process.env.NODE_ENV = 'test';

before(function buildDb(done) {
  models.sequelize.sync({ force: true }).then(function () { 
    return models.User.bulkCreate(require('../utils/data/test/users'));
  }).then(function () {
    done();
  }).catch(function (err) {
    done(err);
  });
});

/*after(function dropDb(done) {
  models.sequelize.drop().then(function () {
    done();
  }).catch(function (err) {
    done(err);
  });
});*/