"use strict";

var moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  var Target = sequelize.define("Target", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: 'The name of the trget must have between 3 and 255 characters'
        }
      }
    },
    notes: {
      type: DataTypes.TEXT
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    zoneOffset: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User timezone offset in minutes'
    },
    wordcount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'The target wordcount must be a positive integer'
        },
        isInt: {
          msg: 'The target wordcount must be a positive integer'
        },
        max: {
          args: 1000000000,
          msg: 'I\'m not judging, but can\'t believe you want to write over a billion words'
        }
      }
    }
  }, {
    tableName: 'targets',
    classMethods: {
      associate: function (models) {
        Target.belongsTo(models.User, {
          as: 'owner',
          foreignKey: 'ownerId'
        });
        Target.belongsToMany(models.Project, {
          as: 'projects',
          through: 'projectsTargets',
          foreignKey: 'targetId'
        });
      }
    },
    indexes: [
      {
        name: 'name',
        unique: true,
        fields: ['name', 'ownerId']
      }
    ],
    validate: {
      startBeforeEnd: function () {
        if (!(moment.utc(this.start).isBefore(this.end))) {
          throw new Error('The start date must be before the end date and both must be valid');
        }
      }
    }
  });

  return Target;
};