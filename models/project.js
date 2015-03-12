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
      type: DataTypes.INTEGER,
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
      },
      set: function (v) {
        var old = this.getDataValue('wordcount');
        var diff = v - old;
        this.setDataValue('currentWordcount', this.getDataValue('currentWordcount') + diff);
        this.setDataValue('wordcount', v);
      }
    },
    charcount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: 0,
          msg: 'The starting character count must be a non-negative integer'
        },
        isInt: {
          msg: 'The starting character count must be a non-negative integer'
        },
        max: {
          args: 3000000000,
          msg: 'I\'m not judging, but can\'t believe you wrote over three billion characters'
        }
      },
      set: function (v) {
        var old = this.getDataValue('charcount');
        var diff = v - old;
        this.setDataValue('currentCharcount', this.getDataValue('currentCharcount') + diff);
        this.setDataValue('charcount', v);
      }
    },
    targetwc: {
      type: DataTypes.INTEGER,
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
    targetcc: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: 0,
          msg: 'The target character count must be a non-negative integer'
        },
        isInt: {
          msg: 'The target character count must be a non-negative integer'
        },
        max: {
          args: 3000000000,
          msg: 'I\'m not judging, but can\'t believe you want to write over three billion characters'
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
    },
    currentWordcount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    currentCharcount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'projects',
    classMethods: {
      associate: function (models) {
        Project.belongsTo(models.User, {
          as: 'owner',
          foreignKey: { name: 'ownerId', allowNull: false },
          onDelete: 'CASCADE'
        });
        Project.hasMany(models.Session, {
          as: 'sessions',
          foreignKey: 'projectId',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
        Project.belongsToMany(models.Genre, {
          as: 'genres',
          through: 'projectsGenres',
          foreignKey: 'projectId'
        });
        Project.belongsToMany(models.Target, {
          as: 'targets',
          through: 'projectsTargets',
          foreignKey: 'ProjectId'
        });
        
        Project.hook('beforeCreate', function (project) {
          project.currentWordcount = project.wordcount;
          project.currentCharcount = project.charcount;
        });
        
        Project.hook('beforeBulkCreate', function (projects, options, done) {
          projects.forEach(function (p) {
            p.currentWordcount = p.wordcount;
            p.currentCharcount = p.charcount;
          });
          done();
        });
        
        Project.hook('beforeDestroy', function (project, options, done) {
          project.setTargets([], {}, {}).then(function () {
            return models.Session.destroy({
              where: {
                projectId: project.id
              }
            });
          }).finally(function () {
            done(null, project);
          });
        });
      }
    },
    paranoid: true,
    validate: {
      uniqueName: function (next) {
        var self = this;
        Project.findOne({
          where: {
            ownerId: this.ownerId,
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
        if (this.targetwc > 0 && parseInt(this.targetwc, 10) < parseInt(this.wordcount, 10)){
          return next(new Error('The target can\'t be less than the starting wordcount'));
        }
        next();
      },
      targetCharOverStart: function (next) {
        if (this.targetcc > 0 && parseInt(this.targetcc, 10) < parseInt(this.charcount, 10)){
          return next(new Error('The target can\'t be less than the starting character count'));
        }
        next();
      }
    },
    indexes: [
      {
        name: 'projects_name',
        unique: false,
        fields: ['name', 'ownerId']
      },
      {
        name: 'projects_deletedAt',
        fields: ['deletedAt']
      }
    ]
  });

  return Project;
};
