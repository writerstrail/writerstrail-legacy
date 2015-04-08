"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.addColumn('application', 'sysmsg', {
      type: DataTypes.TEXT,
      allowNull: true
    })
      .then(function () {
        return migration.addColumn('projects', 'public', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        });
      })
      .then(function () {
        return migration.addColumn('targets', 'public', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        });
      })
      .then(function () {
        return migration.addColumn('projects', 'zoneOffset', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'User timezone offset in minutes'
        });
      })
      .then(function () {
        return migration.addColumn('targets', 'description', {
          type: DataTypes.TEXT,
          allowNull: true,
          defaultValue: null
        });
      })
      .then(done);
  },
  down: function (migration, DataTypes, done) {
    migration.removeColumn('targets', 'public')
      .then(function () {
        return migration.removeColumn('projects', 'zoneOffset');
      })
      .then(function () {
        return migration.removeColumn('projects', 'public');
      })
      .then(function () {
        return migration.removeColumn('application', 'sysmsg');
      })
      .then(done);
  }
};
