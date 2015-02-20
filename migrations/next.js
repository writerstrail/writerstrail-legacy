"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.changeColumn('writingSessions', 'duration', {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Duration of session in seconds',
    }).then(function () {
      return migration.changeColumn('writingSessions', 'pausedTime', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: null,
        comment: 'Paused time of session in seconds'
      });
    }).then(function () {
      done();
    });
  },
  
  down: function (migration, DataTypes, done) {
    migration.changeColumn('writingSessions', 'duration', {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: 'Duration of session in seconds',
    }).then(function () {
      return migration.changeColumn('writingSessions', 'pausedTime', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: 'Paused time of session in seconds'
      });
    }).then(function () {
      done();
    });
  }
  
};