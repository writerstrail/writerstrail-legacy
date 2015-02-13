"use strict";

var dateFormats = require('../utils/data/dateformats'),
  timeFormats = require('../utils/data/timeformats'),
  chartTypes = require('../utils/data/charttypes');

module.exports = function (sequelize, DataTypes) {
  var Settings = sequelize.define("Settings", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    dateFormat: {
      type: DataTypes.ENUM,
      values: dateFormats.data,
      defaultValue: dateFormats.data[0],
      allowNull: false
    },
    timeFormat: {
      type: DataTypes.ENUM,
      values: timeFormats.data,
      defaultValue: timeFormats.data[0],
      allowNull: false
    },
    showRemaining: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    showAdjusted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    chartType: {
      type: DataTypes.ENUM,
      values: chartTypes,
      defaultValue: chartTypes[0],
      allowNull: false
    },
    showTour: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    defaultTimer: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 900,
      validate: {
        min: {
          args: 1,
          msg: 'The default timer must be set to at least one second.'
        },
        max: {
          args: 3659,
          msg: 'The default timer can\'t be longer than 60:59.'
        }
      }
    },
    performanceMetric: {
      type: DataTypes.ENUM,
      values: ['total', 'real'],
      allowNull: false,
      defaultValue: 'total'
    }
  }, {
    tableName: 'settings',
    classMethods: {
      associate: function (models) {
        Settings.belongsTo(models.User, {
          as: 'owner',
          foreignKey: 'id'
        });
      }
    }
  });
  
  return Settings;
};