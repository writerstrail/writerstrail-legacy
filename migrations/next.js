"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.changeColumn('targets', 'wordcount', {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }).then(function (){
      return migration.addColumn('settings', 'defaultTimer', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 900
      });
    }).then(done);
  },
  
  down: function (migration, DataTypes, done) {
    migration.removeColumn('settings', 'defaultTimer').then(function () {
      return migration.changeColumn('targets', 'wordcount', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      });
    }).then(done);
  }
};