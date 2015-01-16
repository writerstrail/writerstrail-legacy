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
		}).then(done);
	},
	
	down: function (migration, DataTypes, done) {
		migration.dropTable('invitations').then(function () {
			return migration.dropTable('users');
		}).then(done);
	}
};
