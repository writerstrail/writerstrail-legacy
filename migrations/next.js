"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.removeIndex('invitations', 'code').then(function () {
      return migration.addIndex('invitations', ['code'], {
        indexName: 'code',
        indicesType: 'UNIQUE'
      });
    }).then(function () {
      return migration.changeColumn('projects', 'currentWordcount', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
      return migration.changeColumn('projects', 'currentWordcount', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      });
    }).then(function () {
      done();
    });
  }
};
