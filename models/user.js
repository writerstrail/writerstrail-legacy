"use strict";

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
		facebookId: {
			type: DataTypes.STRING,
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
		twitterId: {
			type: DataTypes.STRING,
		},
		twitterToken: {
			type: DataTypes.STRING					
		},
		twitterDisplayName: {
			type: DataTypes.STRING
		},
		twitterUsername: {
			type: DataTypes.STRING
		},
		googleId: {
			type: DataTypes.STRING,
		},
		googleToken: {
			type: DataTypes.STRING
		},
		googleEmail: {
			type: DataTypes.STRING
		},
		googleName: {
			type: DataTypes.STRING
		}
	}, {
		classMethods: {
		},
		paranoid: true,
	});
	
	return User;
};