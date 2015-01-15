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
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			}
		},
		activated: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
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