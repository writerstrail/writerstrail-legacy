"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.removeIndex('invitations', 'code').then(function () {
      return migration.addIndex('invitations', ['code'], {
        indexName: 'code',
        indicesType: 'UNIQUE'
      });
    }).then(function () {
      done();
    });
  },

  down: function (migration, DataTypes, done) {
    migration.removeIndex('invitations', 'code').then(function () {
      return migration.addIndex('invitations', ['code'], {
        indexName: 'code'
      });
    }).then(function () {
      done();
    });
  }
};
