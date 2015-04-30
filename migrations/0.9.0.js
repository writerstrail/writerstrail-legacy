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
      .then(function () {
        return migration.addColumn('projects', 'targetunit', {
          type: DataTypes.ENUM,
          values: ['word', 'char'],
          defaultValue: 'word',
          allowNull: false
        });
      })
      .then(function () {
        return migration.addColumn('targets', 'chartOptionsBlob', {
          type: DataTypes.TEXT,
          allowNull: true
        });
      })
      .then(function () {
        return migration.addColumn('projects', 'chartOptionsBlob', {
          type: DataTypes.TEXT,
          allowNull: true
        });
      })
      .then(function () {
        return migration.sequelize.query("UPDATE `SequelizeMeta` SET `name`='0.9.0.js' WHERE `name`='next.js'");
      })
      .then(done);
  },
  down: function (migration, DataTypes, done) {
    migration.sequelize.query("UPDATE `SequelizeMeta` SET `name`='next.js' WHERE `name`='0.9.0.js'")
      .then(function () {
        return migration.removeColumn('projects', 'chartOptionsBlob');
      })
      .then(function () {
        return migration.removeColumn('targets', 'chartOptionsBlob');
      })
      .then(function () {
        return migration.removeColumn('projects', 'targetunit');
      })
      .then(function () {
        return migration.removeColumn('projects', 'correctcc');
      })
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
