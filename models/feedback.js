"use strict";

module.exports = function (sequelize, DataTypes) {
  var Feedback = sequelize.define("Feedback", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: ['Bug', 'Suggestion', 'Feedback'],
      defaultValue: 'Feedback',
      allowNull: false
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [5, 255],
          msg: 'The summary must have between 5 and 255 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'feedback',
    classMethods: {
      associate: function (models) {
        Feedback.belongsTo(models.User, {
          as: 'author',
          foreignKey: 'authorId'
        });
        Feedback.hasMany(models.Vote, {
          as: 'votes',
          foreignKey: 'feedbackId'
        });
      }
    },
    indexes: [
      {
        name: 'type',
        unique: false,
        fields: ['type']
      }
    ]
  });
  
  return Feedback;
};