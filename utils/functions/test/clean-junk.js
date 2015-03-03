var _ = require('lodash');
var promise = require('bluebird');

module.exports = function cleanJunk(junk, after) {
  after(function cleanup(done) {
    var promises = [];
    _.forEach(_.filter(junk, function (v) { return v; }), function (a) {
      promises.push(a.destroy({ force: true }));
    });
    promise.all(promises).then(function () {
      done();
    }).catch(done);
  });
};
