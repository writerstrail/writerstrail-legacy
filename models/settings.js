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
    showPondered: {
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