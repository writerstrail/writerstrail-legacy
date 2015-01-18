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
        }
      }
    },
    description: {
      type: DataTypes.TEXT
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
          as: {
            singular: 'Project',
            plural: 'Projects'
          },
          through: 'projects_genres',
          foreignKey: 'project_id'
        });
        Project.belongsToMany(models.Target, {
          as: {
            singular: 'Project',
            plural: 'Projects'
          },
          through: 'projects_targets',
          foreignKey: 'project_id'
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
    paranoid: true
  });

  return Project;
};
