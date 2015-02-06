"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.renameColumn('settings', 'showPondered', 'showAdjusted').then(done);
  },
  
  down: function (migration, DataTypes, done) {
    migration.renameColumn('settings', 'showAdjusted', 'showPondered').then(done);
  }
};