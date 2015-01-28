"use strict";

var bcrypt = require('bcrypt-nodejs');

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define("User", {
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
          args: [1, 255],
          msg: 'You must provide a name'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          args: true,
          msg: 'The email address must be valid'
        }
      }
    },
    verifiedEmail: {
      type: DataTypes.STRING,
      comment: 'Last email that was verified'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [8, 255],
          msg: 'The password must have at least 8 characters'
        }
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
          as: 'genres',
          foreignKey: 'ownerId'
        });
        User.hasMany(models.Project, {
          as: 'projects',
          foreignKey: 'ownerId'
        });
        User.hasMany(models.Target, {
          as: 'targets',
          foreignKey: 'ownerId'
        });
        User.hasOne(models.Settings, {
          as: 'settings',
          foreignKey: 'id'
        });
        User.hasMany(models.Token, {
          as: 'tokens',
          foreignKey: 'ownerId'
        });
        User.afterValidate(function (user, options, done) {
          if (!user.password) {
            return done(null, user);
          }
          bcrypt.genSalt(8, function (salt) {
            bcrypt.hash(user.password, salt, null, function (err, hash) {
              if (err) { return done(err); }
              user.password = hash;
              done(null, user);
            });
          });
        });
        User.afterCreate(function (user, options, done) {
          var genres = [
            {
              name: 'Fantasy',
              description: 'Mages, Maidens, Heroes and Dragons.',
              ownerId: user.id
            },
            {
              name: 'Science Fiction',
              description: 'Machines, Scientists, Time travel and Space exploration.',
              ownerId: user.id
            }
          ];
          return models.Genre.bulkCreate(genres).then(function () {
            return models.Settings.create({
              id: user.id
            });
          }).then(function () {
            done(null, user);
          });
        });
      }
    },
    instanceMethods: {
      validPassword: function (password) {
        if (this.password) {
          return bcrypt.compareSync(password, this.password);
        }
        return false;
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