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
          msg: 'The target word count must be greater than zero'
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
            singular: 'Target',
            plural: 'Targets'
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
        if (!(moment(this.start).isBefore(this.end))) {
          throw new Error('The start date must be before the end date');
        }
      }
    }
  });

  return Target;
};