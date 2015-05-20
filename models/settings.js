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
    lothreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 33,
      validate: {
        min: {
          args: 0,
          msg: 'The threshold must be equal or greater than zero.'
        },
        max: {
          args: 100,
          msg: 'The threshold must be equal or lesser than 100.'
        }
      }
    },
    hithreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 66,
      validate: {
        min: {
          args: 0,
          msg: 'The threshold must be equal or greater than zero.'
        },
        max: {
          args: 100,
          msg: 'The threshold must be equal or lesser than 100.'
        }
      }
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
      type: DataTypes.INTEGER,
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
          foreignKey: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
        Settings.belongsTo(models.Target, {
          'as': 'target',
          foreignKey: { name: 'targetId', allowNull: true },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        });
      }
    },
    validate: {
      lowThsdBelowHigh: function () {
        if (this.lothreshold >= this.hithreshold) {
          throw new Error('The high threshold must be greater than the low threshold.');
        }
      }
    }
  });
  
  return Settings;
};