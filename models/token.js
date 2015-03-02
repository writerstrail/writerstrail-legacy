"use strict";

module.exports = function (sequelize, DataTypes) {
  var Token = sequelize.define("Token", {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    expire: {
      type: DataTypes.DATE,
      allowNull: false
    },
    data: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM,
      values: ['password', 'email'],
      allowNull: false,
      defaultValue: 'email'
    }
  }, {
    tableName: 'tokens',
    classMethods: {
      associate: function (models) {
        Token.belongsTo(models.User, {
          as: 'owner',
          foreignKey: 'ownerId',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    }
  });
  
  return Token;
};