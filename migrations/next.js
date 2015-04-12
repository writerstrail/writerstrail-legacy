"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.addColumn('settings', 'lothreshold', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 33
    })
      .then(function () {
        return migration.addColumn('settings', 'hithreshold', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 66
        });
      })
      .then(function () {
        return migration.addColumn('projects', 'correctwc', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        });
      })
      .then(function () {
        return migration.addColumn('projects', 'correctcc', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        });
      })
      .then(done);
  },
  down: function (migration, DataTypes, done) {
    migration.removeColumn('projects', 'correctcc')
      .then(function () {
        return migration.removeColumn('projects', 'correctwc');
      })
      .then(function () {
        return migration.removeColumn('settings', 'hithreshold');
      })
      .then(function () {
        return migration.removeColumn('settings', 'lothreshold');
      })
      .then(done);
  }
};
