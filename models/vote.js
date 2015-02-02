"use strict";

module.exports = function (sequelize, DataTypes) {
  var Vote = sequelize.define("Vote", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    vote: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isIn: {
          args: [[-1, 0, 1]],
          msg: 'The vote value must be -1, 0 or 1'
        }
      }
    }
  }, {
    tableName: 'votes',
    classMethods: {
      associate: function (models) {
        Vote.belongsTo(models.User, {
          as: 'voter',
          foreignKey: 'voterId'
        });
        Vote.belongsTo(models.Feedback, {
          as: 'feedback',
          foreignKey: 'feedbackId'
        });
      }
    },
    indexes: [
      {
        name: 'vote',
        fields: ['vote'],
        unique: false
      },
      {
        name: 'oneVoteOnly',
        fields: ['voterId', 'feedbackId'],
        unique: 'true'
      }
    ]
  });
  
  return Vote;
};