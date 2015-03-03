process.env.NODE_ENV = process.env.NODE_ENV || 'test';
var exec = require('child_process').exec;

before(function buildDb(done) {
  this.timeout(20000);
  console.log('Building database...');
  exec('make migrate NODE_ENV=' + process.env.NODE_ENV, function () {
    console.log('Database built.');
    done();
  });
});

after(function dropDb(done) {
  this.timeout(20000);
  console.log('Dropping database...');
  exec('make undomigrate NODE_ENV=' + process.env.NODE_ENV, function () {
    console.log('Database dropped.');
    done();
  });
});
