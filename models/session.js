"use strict";

var promise = require("sequelize").Promise,
  _ = require('lodash');

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
          args: [1, 255],
          msg: 'The summary must have between 1 and 255 characters'
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
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration of session in seconds',
      validate: {
        min: {
          args: 1,
          msg: 'The duration can\'t be zero'
        },
        max: {
          args: 86399,
          msg: 'The duration may be at most 23:59'
        }
      }
    },
    pausedTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Paused time of session in seconds',
      validate: {
        min: {
          args: 0,
          msg: 'The duration can\'t be negative'
        }
      }
    },
    wordcount: {
      type: DataTypes.INTEGER,
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
          foreignKey: { name: 'projectId', allowNull: false },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
        
        Session.hook('afterCreate', function (session, options, done){
          models.Project.findOne(session.projectId).then(function (project) {
            return project.increment({
              currentWordcount: session.wordcount
            });
          }).then(function () {
            done(null, session);
          }).catch(
            /* istanbul ignore next */
            function (err) {
            done(err);
          });
        });
        
        Session.hook('afterBulkCreate', function (sessions, options, done){
          if (!options.individualHooks) {
            var promises = [];
            
            _.forEach(sessions, function (session) {
              promises.push(models.Project.findOne(session.projectId).then(function (project) {
                if (!project) { return promise.resolve(null); }
                return project.increment({
                  currentWordcount: session.wordcount
                });
              }));
            });

            promise.all(promises).then(function () {
              done(null, sessions);
            }).catch(
              /* istanbul ignore next */
              function (err) {
              done(err);
            });
          } else {
            done(null, sessions);
          }
        });
        
        Session.hook('afterUpdate', function (session, options, done) {
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
          }).catch(
            /* istanbul ignore next */
            function (err) {
            done(err);
          });
        });
        
        Session.hook('beforeBulkUpdate', function (options, done) {
          done('Bulk update is not allowed');
        });
        
        Session.hook('afterDestroy', function (session, options, done){
          models.Project.findOne(session.projectId).then(function (project) {
            if (project) {
              return project.decrement({
                currentWordcount: session.wordcount
              }, { transaction: options.transaction });
            }
            return false;
          }).then(function () {
            done(null, session);
          }).catch(
            /* istanbul ignore next */
            function (err) {
            done(err);
          });
        });
        
        Session.hook('afterBulkDestroy', function (opt, done) {
          Session.findAll({
            where: opt.where,
            paranoid: false
          }).then(function (sessions) {
            var promises = [];
            _.forEach(sessions, function (s) {
              var p = models.Project.findOne(s.projectId).then(function (project) {
                if (!project) { return null; }
                return project.decrement({
                  currentWordcount: s.wordcount
                });
              });
              promises.push(p);
            });
            return promise.all(promises);
          }).then(function () {
            done(null);
          }).catch(done);
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
        name: 'writingSessions_start',
        fields: ['start']
      },
      {
        name: 'writingSessions_deletedAt',
        fields: ['deletedAt']
      }
    ]
  });

  return Session;
};
