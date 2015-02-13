"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.sequelize.query("ALTER ALGORITHM = MERGE VIEW `sessionPerformance` AS SELECT `p`.`ownerId` AS `ownerId` , avg( ( `s`.`wordcount` / ( `s`.`duration` /60 ) ) ) AS `performance` , avg( ( `s`.`wordcount` / ( ( `s`.`duration` - `s`.`pausedTime` ) /60 ) ) ) AS `realPerformance` , (  CASE WHEN ( `s`.`isCountdown` =0 ) THEN 'forward' ELSE 'countdown' END ) AS `direction` , round( ( `s`.`duration` /60 ), 0 ) AS `minuteDuration` FROM ( `writingSessions` `s` JOIN `projects` `p` ON ( ( `p`.`id` = `s`.`projectId` ) ) ) WHERE isnull( `s`.`deletedAt` ) GROUP BY `p`.`ownerId` , round( ( `s`.`duration` /60 ), 0 ) , `s`.`isCountdown`;").then(function () {
      return migration.sequelize.query("ALTER ALGORITHM = MERGE VIEW `periodPerformance` AS SELECT `p`.`ownerId` AS `ownerID` , avg( ( `s`.`wordcount` / ( `s`.`duration` /60 ) ) ) AS `performance` , avg( ( `s`.`wordcount` / ( ( `s`.`duration` - `s`.`pausedTime` ) /60 ) ) ) AS `realPerformance` , `t`.`name` AS `period` , `t`.`start` AS `start` , `t`.`end` AS `end` FROM ( ( `writingSessions` `s` JOIN `projects` `p` ON ( ( `p`.`id` = `s`.`projectId` ) ) ) JOIN `periods` `t` ON ( (  CASE WHEN ( `t`.`start` < `t`.`end` ) THEN ( cast( `s`.`start` AS time ) BETWEEN `t`.`start` AND `t`.`end` ) ELSE ( ( cast( `s`.`start` AS time ) >= `t`.`start` ) OR ( cast( `s`.`start` AS time ) <= `t`.`end` ) ) END ) ) ) WHERE isnull( `s`.`deletedAt` ) GROUP BY `p`.`ownerId` , `t`.`name`;");
    }).then(function () {
      return migration.changeColumn('targets', 'wordcount', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
      });
    }).then(function (){
      return migration.addColumn('settings', 'defaultTimer', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 900
      });
    }).then(function (){
      return migration.addColumn('settings', 'performanceMetric', {
        type: DataTypes.ENUM,
        values: ['total', 'real'],
        allowNull: false,
        defaultValue: 'total'
      });
    }).then(done);
  },
  
  down: function (migration, DataTypes, done) {
    migration.sequelize.query("ALTER ALGORITHM = MERGE VIEW `periodPerformance` AS SELECT `p`.`ownerId` AS `ownerID` , avg( ( `s`.`wordcount` / ( `s`.`duration` /60 ) ) ) AS `performance` , `t`.`name` AS `period` , `t`.`start` AS `start` , `t`.`end` AS `end` FROM ( ( `writingSessions` `s` JOIN `projects` `p` ON ( ( `p`.`id` = `s`.`projectId` ) ) ) JOIN `periods` `t` ON ( (  CASE WHEN ( `t`.`start` < `t`.`end` ) THEN ( cast( `s`.`start` AS time ) BETWEEN `t`.`start` AND `t`.`end` ) ELSE ( ( cast( `s`.`start` AS time ) >= `t`.`start` ) OR ( cast( `s`.`start` AS time ) <= `t`.`end` ) ) END ) ) ) GROUP BY `p`.`ownerId` , `t`.`name` ORDER BY avg( ( `s`.`wordcount` / ( `s`.`duration` /60 ) ) ) DESC;").then(function () {
      return migration.sequelize.query("ALTER ALGORITHM = MERGE VIEW `sessionPerformance` AS SELECT `p`.`ownerId` AS `ownerId` , avg( ( `s`.`wordcount` / ( `s`.`duration` /60 ) ) ) AS `performance`, (  CASE WHEN ( `s`.`isCountdown` =0 ) THEN 'forward' ELSE 'countdown' END ) AS `direction` , round( ( `s`.`duration` /60 ), 0 ) AS `minuteDuration` FROM ( `writingSessions` `s` JOIN `projects` `p` ON ( ( `p`.`id` = `s`.`projectId` ) ) ) GROUP BY `p`.`ownerId` , round( ( `s`.`duration` /60 ), 0 ) , `s`.`isCountdown` ORDER BY avg( ( `s`.`wordcount` / ( `s`.`duration` /60 ) ) ) DESC;");
    }).then(function () {
      return migration.removeColumn('settings', 'performanceMetric');
    }).then(function () {
      return migration.removeColumn('settings', 'defaultTimer');
    }).then(function () {
      return migration.changeColumn('targets', 'wordcount', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      });
    }).then(done);
  }
};