"use strict";

module.exports = function (sequelize, DataTypes) {
  var Invitation = sequelize.define("Invitation", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
          len: [1, 255]
      }
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    }
  }, {
    tableName: 'invitations',
    classMethods: {},
    indexes: [{
      name: 'invitations_code',
      unique: true,
      fields: ['code']
    }]
  });

  return Invitation;
};