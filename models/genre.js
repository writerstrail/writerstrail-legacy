"use strict";

module.exports = function (sequelize, DataTypes) {
	var Genre = sequelize.define("Genre", {
		name: DataTypes.STRING
	}, {
		classMethods: {
			associate: function (models) {
				Genre.belongsTo(models.User);
			}
		}
	});

	return Genre;
};