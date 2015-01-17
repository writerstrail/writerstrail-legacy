"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.createTable('genres', {
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
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: 'users',
        referencesKey: 'id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      }
    }, {
      charset: 'utf8'
    }).then(function () {
      return migration.addIndex('genres', ['name', 'owner_id'], {
        indexName: 'name_owner',
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
        owner_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'users',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
          type: DataTypes.DATE,
          allowNull: true,
        }
      }, {
        charset: 'utf8'
      });
    }).then(function () {
      return migration.addIndex('projects', ['name', 'owner_id'], {
        indexName: 'name_owner',
        indicesType: 'UNIQUE'
      });
    }).then(function () {
      return migration.createTable('projects_genres', {
        project_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: 'projects',
          referencesKey: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          primaryKey: 'PRIMARY'
        },
        genre_id: {
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
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        }
      }, {
        charset: 'utf8'
      });
    }).then(done);
  },

  down: function (migration, DataTypes, done) {
    migration.dropTable('projects_genres').then(function () {
      return migration.dropTable('projects');
    }).then(function () {
      return migration.dropTable('genres');
    }).then(done);
  }
};
