"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.addColumn('settings', 'lothreshold', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 33
    })
      .then(function () {
        return migration.addColumn('settings', 'hithreshold', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 66
        });
      })
      .then(done);
  },
  down: function (migration, DataTypes, done) {
    migration.removeColumn('settings', 'hithreshold')
      .then(function () {
        return migration.removeColumn('settings', 'lothreshold');
      })
      .then(done);
  }
};
