var _ = require('lodash');

module.exports = function genString(size) {
  return _.reduce(_.range(size), function (acc) {
    return acc += '0';
  }, '');
};