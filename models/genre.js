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
				len: [3, 255],
				msg: 'The name of the genre must have between 3 and 255 characters'
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
					as: 'Owner',
					foreignKey: 'id'
				});
			}
		},
		indexes: [
			{
				name: 'name',
				unique: true,
				fields: ['name', 'owner_id']
			}
		]
	});
	
	return Genre;
};
