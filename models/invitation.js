"use strict";

module.exports = function (sequelize, DataTypes) {
	var Invitation = sequelize.define("Invitation", {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		code: {
			type: DataTypes.STRING,
			unique: true
		}
	}, {
		classMethods: {}
	});
};