"use strict";

module.exports = function (sequelize, DataTypes) {
  var Genre = sequelize.define("Genre", {
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
          msg: 'The name of the genre must have between 3 and 255 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'genres',
    classMethods: {
      associate: function (models) {
        Genre.belongsTo(models.User, {
          as: 'owner',
          foreignKey: 'ownerId',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
        Genre.belongsToMany(models.Project, {
          as: 'projects',
          through: 'projectsGenres',
          foreignKey: 'genreId',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    },
    indexes: [
      {
        name: 'name',
        unique: true,
        fields: ['name', 'ownerId']
      }
    ]
  });

  return Genre;
};
