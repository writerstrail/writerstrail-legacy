"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.renameColumn('settings', 'showPondered', 'showAdjusted').then(function () {
      return migration.createTable('application', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: false,
          primaryKey: true
        },
        maintenance: {
          type: DataTypes.ENUM,
          values: ['off', 'soft', 'hard'],
          allowNull: false,
          defaultValue: 'off',
          comment: "Enable/disable maintenance mode"
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
      return migration.sequelize.query("INSERT INTO application (id, maintenance, createdAt, updatedAt) VALUES (1, 'off', NOW(), NOW());");
    }).then(done);
  },
  
  down: function (migration, DataTypes, done) {
    migration.dropTable('application').then(function () {
      return migration.renameColumn('settings', 'showAdjusted', 'showPondered');
    }).then(done);
  }
};