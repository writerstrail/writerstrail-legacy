"use strict";

module.exports = function (sequelize, DataTypes) {
  var Project = sequelize.define("Project", {
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
          msg: 'The name of the project must have between 3 and 255 characters'
        },
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    wordcount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: 0,
          msg: 'The starting wordcount must be a non-negative integer'
        },
        isInt: {
          msg: 'The starting wordcount must be a non-negative integer'
        },
        max: {
          args: 1000000000,
          msg: 'I\'m not judging, but can\'t believe you wrote over a billion words'
        }
      }
    },
    targetwc: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: 0,
          msg: 'The target wordcount must be a non-negative integer'
        },
        isInt: {
          msg: 'The target wordcount must be a non-negative integer'
        },
        max: {
          args: 1000000000,
          msg: 'I\'m not judging, but can\'t believe you want to write over a billion words'
        }
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    finished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'projects',
    classMethods: {
      associate: function (models) {
        Project.belongsTo(models.User, {
          as: 'Owner',
          foreignKey: 'owner_id',
          onDelete: 'CASCADE'
        });
        Project.belongsToMany(models.Genre, {
          as: 'Genres',
          through: 'projects_genres',
          foreignKey: 'project_id'
        });
        Project.belongsToMany(models.Target, {
          as: 'Targets',
          through: 'projects_targets',
          foreignKey: 'project_id'
        });
      }
    },
    paranoid: true,
    validate: {
      uniqueName: function (next) {
        var self = this;
        Project.findOne({
          where: {
            owner_id: this.owner_id,
            name: this.name
          }
        }).then(function (p) {
          if (p && p.id !== this.id) {
            next(new Error('The project name must be unique'));
          } else {
            next();
          }
        }.bind(self)).catch(function (err) {
          next(err);
        });
      },
      targetOverStart: function (next) {
        if(this.targetwc < this.wordcount) {
          return next(new Error('The target can\'t be less than the starting wordcount'));
        }
        next();
      } 
    }
  });

  return Project;
};