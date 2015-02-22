"use strict";

var promise = require("sequelize").Promise;

module.exports = function (sequelize, DataTypes) {
  var Session = sequelize.define("Session", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'The summary must have at most 255 characters'
        }
      }
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    zoneOffset: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'User timezone offset in minutes'
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Duration of session in seconds',
      validate: {
        min: {
          args: 1,
          msg: 'The duration can\'t be zero'
        }
      }
    },
    pausedTime: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: 'Paused time of session in seconds'
    },
    wordcount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'The written wordcount must be a positive integer'
        },
        isInt: {
          msg: 'The written wordcount must be a positive integer'
        },
        max: {
          args: 1000000000,
          msg: 'I\'m not judging, but can\'t believe you wrote over a billion words'
        }
      }
    },
    isCountdown: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'writingSessions',
    paranoid: true,
    classMethods: {
      associate: function (models) {
        Session.belongsTo(models.Project, {
          as: 'project',
          foreignKey: 'projectId',
          onDelete: 'CASCADE'
        });
        
        Session.afterCreate(function (session, options, done){
          models.Project.findOne(session.projectId).then(function (project) {
            return project.increment({
              currentWordcount: session.wordcount
            });
          }).then(function () {
            done(null, session);
          }).catch(function (err) {
            done(err);
          });
        });
        
        Session.afterUpdate(function (session, options, done) {
          var promises = [];
          promises.push(models.Project.findOne(session._previousDataValues.projectId).then(function (project) {
            return project.decrement({
              currentWordcount: session._previousDataValues.wordcount 
            });
          }));
          promises.push(models.Project.findOne(session.projectId).then(function (project) {
            return project.increment({
              currentWordcount: session.wordcount
            });
          }));
          promise.all(promises).then(function () {
            done(null, session);
          }).catch(function (err) {
            done(err);
          });
        });
        
        Session.afterDestroy(function (session, options, done){
          models.Project.findOne(session.projectId).then(function (project) {
            return project.decrement({
              currentWordcount: session.wordcount
            });
          }).then(function () {
            done(null, session);
          }).catch(function (err) {
            done(err);
          });
        });
      }
    },
    validate: {
      pausedLessThanDuration: function () {
        if (this.duration !== null && this.pausedTime >= this.duration) {
          throw new Error('The paused time must be less than the duration');
        }
      }
    },
    indexes: [
      {
        name: 'start',
        fields: ['start']
      }
    ]
  });

  return Session;
};
