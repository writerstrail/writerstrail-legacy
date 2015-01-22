"use strict";

var dateFormats = require('../utils/data/dateformats');

module.exports = function (sequelize, DataTypes) {
  var Settings = sequelize.define("Settings", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    dateFormat: {
      type: DataTypes.ENUM,
      values: dateFormats,
      defaultValue: dateFormats[0],
      allowNull: false
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