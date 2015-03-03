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
          args: [[-1, 1]],
          msg: 'The vote value must be -1 or 1'
        }
      }
    }
  }, {
    tableName: 'votes',
    classMethods: {
      associate: function (models) {
        Vote.belongsTo(models.User, {
          as: 'voter',
          foreignKey: 'voterId',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
        Vote.belongsTo(models.Feedback, {
          as: 'feedback',
          foreignKey: 'feedbackId',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
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