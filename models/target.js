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
          as: 'Owner',
          foreignKey: 'owner_id'
        });
        Target.belongsToMany(models.Project, {
          as: {
            singular: 'Project',
            plural: 'Projects'
          },
          through: 'projects_targets',
          foreignKey: 'target_id'
        });
      }
    },
    indexes: [
      {
        name: 'name',
        unique: true,
        fields: ['name', 'owner_id']
      }
    ],
    validate: {
      startBeforeEnd: function () {
        console.log('---start', this.start);
        console.log('---end', this.end);
        if (!(moment(this.start).isBefore(this.end))) {
          throw new Error('The start date must be before the end date and both must be valid');
        }
      }
    }
  });

  return Target;
};