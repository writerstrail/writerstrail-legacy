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
				allowNull: false,
				validate: {
					len: [3, 255],
					msg: 'The name of the genre must have between 3 and 255 characters'
				}
			},
			description: {
				type: DataTypes.TEXT
			},
			owner_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: 'users',
				referenceKey: 'id',
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
			return migration.addIndex('genres', ['name', 'owner_id'], { indexName: 'name' });
		}).then(done);
	},
	
	down: function (migration, DataTypes, done) {
		migration.dropTable('genres').then(done);
	}
};
