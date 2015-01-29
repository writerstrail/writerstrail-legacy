"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING
      },
      verifiedEmail: {
        type: DataTypes.STRING,
        comment: 'Last email that was verified'
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true
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
        type: DataTypes.STRING
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
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE
      }
    }, {
      charset: 'utf8'
    }).then(function () {
      return migration.addIndex('users', ['name'], { indexName: 'name' });
    }).then(function () {
      return migration.addIndex('users', ['email'], { indexName: 'email' });
    }).then(function () {
      return migration.createTable('invitations', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        code: {
          type: DataTypes.STRING,
          allowNull: false
        },
        amount: {
          type: DataTypes.INTEGER.UNSIGNED,
          defaultValue: 1
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        }
      },
      {
        charset: 'utf8'
      });
    }).then(function () {
      return migration.addIndex('invitations', ['code'], { indexName: 'code' });
    }).then(function () {
      return migration.createTable('genres', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT
        },
        ownerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'users',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }, {
        charset: 'utf8'
      });
    }).then(function () {
      return migration.addIndex('genres', ['name', 'ownerId'], {
        indexName: 'name',
        indicesType: 'UNIQUE'
      });
    }).then(function () {
      return migration.createTable('projects', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT
        },
        wordcount: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0
        },
        targetwc: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0
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
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0
        },
        ownerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'users',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true
        }
      }, {
        charset: 'utf8'
      });
    }).then(function () {
      return migration.addIndex('projects', ['name', 'ownerId'], {
        indexName: 'name'
      });
    }).then(function () {
      return migration.createTable('projectsGenres', {
        projectId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'projects',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          primaryKey: 'PRIMARY'
        },
        genreId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'genres',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          primaryKey: 'PRIMARY'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }, {
        charset: 'utf8'
      });
    }).then(function () {
      return migration.createTable('writingSessions', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        summary: {
          type: DataTypes.STRING,
          allowNull: true
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
          allowNull: false,
          comment: 'Duration of session in seconds'
        },
        pausedTime: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          comment: 'Paused time of session in seconds'
        },
        wordcount: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false
        },
        isCountdown: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        notes: {
          type: DataTypes.TEXT
        },
        projectId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'projects',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }, {
        charset: 'utf8'
      });
    }).then(function () {
      return migration.addIndex('writingSessions', ['start'], {
        indexName: 'start'
      });
    }).then(function () {
      return migration.createTable('targets', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
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
          allowNull: false
        },
        ownerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'users',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }, {
        charset: 'utf8'
      });
    }).then(function () {
      return migration.addIndex('targets', ['name', 'ownerId'], {
        indexName: 'name',
        indicesType: 'UNIQUE'
      });
    }).then(function () {
      return migration.createTable('projectsTargets', {
        projectId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'projects',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          primaryKey: 'PRIMARY'
        },
        targetId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'targets',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          primaryKey: 'PRIMARY'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }, {
        charset: 'utf8'
      });
    }).then(function () {
      return migration.createTable('settings', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: 'users',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        dateFormat: {
          type: DataTypes.ENUM,
          values: [
            'YYYY-MM-DD',
            'YYYY/MM/DD',
            'DD-MM-YYYY',
            'DD/MM/YYYY',
            'MM-DD-YYYY',
            'MM/DD/YYYY'
          ],
          defaultValue: 'YYYY-MM-DD',
          allowNull: false
        },
        timeFormat: {
          type: DataTypes.ENUM,
          values: [
            'H:mm:ss',
            'HH:mm:ss',
            'h:mm:ss A',
            'hh:mm:ss A',
            'h:mm:ss a',
            'hh:mm:ss a'
          ],
          defaultValue: 'HH:mm:ss',
          allowNull: false
        },        
        chartType: {
          type: DataTypes.ENUM,
          values: [
            'cumulative',
            'daily'
          ],
          defaultValue: 'cumulative',
          allowNull: false
        },
        showRemaining: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        showPondered: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }, {
        charset: 'utf8',
        collate: 'utf8_bin'
      });
    }).then(function () {
      return migration.createTable('tokens', {
        token: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true
        },
        expire: {
          type: DataTypes.DATE,
          allowNull: false
        },
        data: {
          type: DataTypes.STRING,
          allowNull: true
        },
        type: {
          type: DataTypes.ENUM,
          values: ['password', 'email'],
          allowNull: false,
          defaultValue: 'email'
        },
        ownerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'users',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }, {
        charset: 'utf8',
        collate: 'utf8_bin'
      });
    }).then(done);
  },
  
  down: function (migration, DataTypes, done) {
    migration.dropTable('tokens').then(function () {
      return migration.dropTable('settings');
    }).then(function () {
      return migration.dropTable('projectsTargets');
    }).then(function () {
      return migration.dropTable('targets');
    }).then(function () {
      return migration.dropTable('writingSessions');
    }).then(function () {
      return migration.dropTable('projectsGenres');
    }).then(function () {
      return migration.dropTable('projects');
    }).then(function () {
      return migration.dropTable('genres');
    }).then(function () {
      return migration.dropTable('invitations');
    }).then(function () {
      return migration.dropTable('users');
    }).then(done);
  }
};
