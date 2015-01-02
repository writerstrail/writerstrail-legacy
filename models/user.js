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
			unique: true
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
			unique: true
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
			unique: true
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