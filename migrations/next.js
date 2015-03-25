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
      return migration.addColumn('projects', 'charcount', {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
    }).then(function () {
      return migration.addColumn('projects', 'currentCharcount', {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
    }).then(function () {
      return migration.addColumn('projects', 'targetcc', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      });
    }).then(function () {
      return migration.addColumn('writingSessions', 'charcount', {
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
      return migration.removeColumn('writingSessions', 'charcount');
    }).then(function () {
      return migration.removeColumn('projects', 'targetcc');
    }).then(function () {
      return migration.removeColumn('projects', 'currentCharcount');
    }).then(function () {
      return migration.removeColumn('projects', 'charcount');
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
