var _ = require('lodash');

module.exports = function filterIds(all, include) {
  return _.filter(all, function (g) { 
    return _.contains(_.map(include, function (v){
      return parseInt(v, 10);
    }), g.id);
  });
};