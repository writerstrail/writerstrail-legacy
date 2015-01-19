"use strict";

var _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    activated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM,
      values: ['user', 'moderator', 'admin', 'superadmin'],
      defaultValue: 'user',
      allowNull: false
    },
    lastAccess: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    invitationCode: {
      type: DataTypes.STRING,
      validate: {
        min: 1
      }
    },
    facebookId: {
      type: DataTypes.STRING
    },
    facebookToken: {
      type: DataTypes.STRING
    },
    facebookEmail: {
      type: DataTypes.STRING
    },
    facebookName: {
      type: DataTypes.STRING
    },
    googleId: {
      type: DataTypes.STRING
    },
    googleToken: {
      type: DataTypes.STRING
    },
    googleEmail: {
      type: DataTypes.STRING
    },
    googleName: {
      type: DataTypes.STRING
    },
    linkedinId: {
      type: DataTypes.STRING
    },
    linkedinToken: {
      type: DataTypes.STRING
    },
    linkedinEmail: {
      type: DataTypes.STRING
    },
    linkedinName: {
      type: DataTypes.STRING
    },
    wordpressId: {
      type: DataTypes.STRING
    },
    wordpressToken: {
      type: DataTypes.STRING
    },
    wordpressEmail: {
      type: DataTypes.STRING
    },
    wordpressName: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'users',
    classMethods: {
      associate: function (models) {
        User.hasMany(models.Genre, {
          as: {
            singular: 'Genre',
            plural: 'Genres',
          },
          foreignKey: 'owner_id'
        });
        User.hasMany(models.Project, {
          as: {
            singular: 'Project',
            plural: 'Projects',
          },
          foreignKey: 'owner_id'
        });
        User.hasMany(models.Target, {
          as: {
            singular: 'Target',
            plural: 'Targets',
          },
          foreignKey: 'owner_id'
        });
        User.afterCreate(function (user) {
          var genres = [
            {
              name: 'Fantasy',
              description: 'Mages, Maidens, Heroes and Dragons.',
              owner_id: user.id
            },
            {
              name: 'Science Fiction',
              description: 'Machines, Scientists, Time travel and Space exploration.',
              owner_id: user.id
            }
          ];
          models.Genre.bulkCreate(genres);
        });
      }
    },
    paranoid: true,
    indexes: [
      {
        name: 'name',
        unique: false,
        fields: ['name']
      },
      {
        name: 'email',
        unique: false,
        fields: ['email']

      }
    ]
  });

  return User;
};