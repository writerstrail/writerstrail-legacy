"use strict";

module.exports = function (sequelize, DataTypes) {
  var App = sequelize.define("App", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    maintenance: {
      type: DataTypes.ENUM,
      values: ['off', 'soft', 'hard'],
      allowNull: false,
      defaultValue: 'off',
      comment: "Enable/disable maintenance mode"
    },
    sysmsg: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'application'
  });

  return App;
};
