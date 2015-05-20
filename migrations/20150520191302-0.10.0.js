"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.addColumn('settings', 'targetId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: 'targets',
      referencesKey: 'id',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }).then(done);
  },

  down: function (migration, DataTypes, done) {
    migration.removeColumn('settings', 'targetId')
        .then(done);
  }
};
