process.env.NODE_ENV = process.env.NODE_ENV || 'test';
var exec = require('child_process').exec;

before(function buildDb(done) {
  this.timeout(30000);
  console.log('Building database...');
  exec('make migrate NODE_ENV=' + process.env.NODE_ENV, function () {
    console.log('Database built.');
    console.log('Creating users...');
    models.User.bulkCreate(require('../utils/data/test/users')).then(function () {
      console.log('Users created.');
      done();
    });
  });
});

after(function dropDb(done) {
  this.timeout(30000);
  console.log('Dropping database...');
  exec('make undomigrate NODE_ENV=' + process.env.NODE_ENV, function () {
    console.log('Database dropped.');
    done();
  });
});
