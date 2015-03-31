"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.addColumn('application', 'sysmsg', {
      type: DataTypes.STRING,
      allowNull: true
    })
      .then(done);
  },
  down: function (migration, DataTypes, done) {
    migration.removeColumn('application', 'sysmsg')
      .then(done);
  }
};
