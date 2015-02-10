"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.changeColumn('targets', 'wordcount', {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }).then(done);
  },
  
  down: function (migration, DataTypes, done) {
    migration.changeColumn('targets', 'wordcount', {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }).then(done);
  }
};