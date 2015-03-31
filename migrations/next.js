"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.addColumn('application', 'sysmsg', {
      type: DataTypes.STRING,
      allowNull: true
    })
      .then(function () {
        return migration.addColumn('projects', 'public', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        });
      })
      .then(done);
  },
  down: function (migration, DataTypes, done) {
    migration.removeColumn('projects', 'public')
      .then(function () {
        return migration.removeColumn('application', 'sysmsg');
      })
      .then(done);
  }
};
