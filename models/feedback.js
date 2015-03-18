"use strict";

var feedbackstati = require('../utils/data/feedbackstati'),
  feedbacktypes = require('../utils/data/feedbacktypes');

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
      values: feedbacktypes,
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
    },
    status: {
      type: DataTypes.ENUM,
      values: feedbackstati,
      allowNull: false,
      defaultValue: 'New'
    },
    response: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'feedback',
    paranoid: true,
    classMethods: {
      associate: function (models) {
        Feedback.belongsTo(models.User, {
          as: 'author',
          foreignKey: 'authorId',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
        Feedback.hasMany(models.Vote, {
          as: 'votes',
          foreignKey: 'feedbackId',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
        Feedback.belongsTo(models.User, {
          as: 'originalAuthor',
          foreignKey: 'originalAuthorId',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
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