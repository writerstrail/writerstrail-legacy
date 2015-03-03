process.env.NODE_ENV = process.env.NODE_ENV || 'test';
var exec = require('child_process').exec;

before(function buildDb(done) {
  this.timeout(20000);
  exec('make migrate NODE_ENV=' + process.env.NODE_ENV, done);
});

after(function dropDb(done) {
  this.timeout(20000);
  exec('make undomigrate NODE_ENV=' + process.env.NODE_ENV, done);
});