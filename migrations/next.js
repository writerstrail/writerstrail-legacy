"use strict";

module.exports = {
  up: function (migration, DataTypes, done) {
    migration.sequelize.query("ALTER ALGORITHM = MERGE VIEW `sessionPerformance` AS SELECT `p`.`ownerId` AS `ownerId` , avg( ( `s`.`wordcount` / ( `s`.`duration` /60 ) ) ) AS `performance` , avg( ( `s`.`wordcount` / ( ( `s`.`duration` - `s`.`pausedTime` ) /60 ) ) ) AS `realPerformance` , (  CASE WHEN ( `s`.`isCountdown` =0 ) THEN 'forward' ELSE 'countdown' END ) AS `direction` , round( ( `s`.`duration` /60 ), 0 ) AS `minuteDuration` FROM ( `writingSessions` `s` JOIN `projects` `p` ON ( ( `p`.`id` = `s`.`projectId` ) ) ) WHERE isnull( `s`.`deletedAt` ) AND `s`.`duration` IS NOT NULL GROUP BY `p`.`ownerId` , round( ( `s`.`duration` /60 ), 0 ) , `s`.`isCountdown`;").then(function () {
      return migration.sequelize.query("ALTER ALGORITHM = MERGE VIEW `periodPerformance` AS SELECT `p`.`ownerId` AS `ownerID` , avg( ( `s`.`wordcount` / ( `s`.`duration` /60 ) ) ) AS `performance` , avg( ( `s`.`wordcount` / ( ( `s`.`duration` - `s`.`pausedTime` ) /60 ) ) ) AS `realPerformance` , `t`.`name` AS `period` , `t`.`start` AS `start` , `t`.`end` AS `end` FROM ( ( `writingSessions` `s` JOIN `projects` `p` ON ( ( `p`.`id` = `s`.`projectId` ) ) ) JOIN `periods` `t` ON ( (  CASE WHEN ( `t`.`start` < `t`.`end` ) THEN ( cast( `s`.`start` AS time ) BETWEEN `t`.`start` AND `t`.`end` ) ELSE ( ( cast( `s`.`start` AS time ) >= `t`.`start` ) OR ( cast( `s`.`start` AS time ) <= `t`.`end` ) ) END ) ) ) WHERE isnull( `s`.`deletedAt` ) AND `s`.`duration` IS NOT NULL GROUP BY `p`.`ownerId` , `t`.`name`;");
    }).then(function () {
      return migration.changeColumn('writingSessions', 'duration', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Duration of session in seconds'
      });
    }).then(function () {
      return migration.changeColumn('writingSessions', 'pausedTime', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: null,
        comment: 'Paused time of session in seconds'
      });
    }).then(function () {
      return migration.sequelize.query("UPDATE `writingSessions` SET `duration` = NULL, `pausedTime` = NULL WHERE `duration` = 0;");
    }).then(function () {
      return migration.sequelize.query("CREATE ALGORITHM=MERGE VIEW `dailyAverages` AS select cast(`Session`.`start` as date) AS `date`,avg(`Session`.`wordcount`) AS `average`,count(`Session`.`id`) AS `total`,`project`.`ownerId` AS `ownerId` from (`writingSessions` `Session` join `projects` `project` on(((`Session`.`projectId` = `project`.`id`) and isnull(`project`.`deletedAt`)))) where isnull(`Session`.`deletedAt`) group by cast(`Session`.`start` as date),`project`.`ownerId`");
    }).then(function () {
      done();
    });
  },
  
  down: function (migration, DataTypes, done) {
    migration.sequelize.query("ALTER ALGORITHM = MERGE VIEW `sessionPerformance` AS SELECT `p`.`ownerId` AS `ownerId` , avg( ( `s`.`wordcount` / ( `s`.`duration` /60 ) ) ) AS `performance` , avg( ( `s`.`wordcount` / ( ( `s`.`duration` - `s`.`pausedTime` ) /60 ) ) ) AS `realPerformance` , (  CASE WHEN ( `s`.`isCountdown` =0 ) THEN 'forward' ELSE 'countdown' END ) AS `direction` , round( ( `s`.`duration` /60 ), 0 ) AS `minuteDuration` FROM ( `writingSessions` `s` JOIN `projects` `p` ON ( ( `p`.`id` = `s`.`projectId` ) ) ) WHERE isnull( `s`.`deletedAt` ) GROUP BY `p`.`ownerId` , round( ( `s`.`duration` /60 ), 0 ) , `s`.`isCountdown`;").then(function () {
      return migration.sequelize.query("ALTER ALGORITHM = MERGE VIEW `periodPerformance` AS SELECT `p`.`ownerId` AS `ownerID` , avg( ( `s`.`wordcount` / ( `s`.`duration` /60 ) ) ) AS `performance` , avg( ( `s`.`wordcount` / ( ( `s`.`duration` - `s`.`pausedTime` ) /60 ) ) ) AS `realPerformance` , `t`.`name` AS `period` , `t`.`start` AS `start` , `t`.`end` AS `end` FROM ( ( `writingSessions` `s` JOIN `projects` `p` ON ( ( `p`.`id` = `s`.`projectId` ) ) ) JOIN `periods` `t` ON ( (  CASE WHEN ( `t`.`start` < `t`.`end` ) THEN ( cast( `s`.`start` AS time ) BETWEEN `t`.`start` AND `t`.`end` ) ELSE ( ( cast( `s`.`start` AS time ) >= `t`.`start` ) OR ( cast( `s`.`start` AS time ) <= `t`.`end` ) ) END ) ) ) WHERE isnull( `s`.`deletedAt` ) GROUP BY `p`.`ownerId` , `t`.`name`;");
    }).then(function () {
      return migration.sequelize.query("DROP VIEW `dailyAverages`;");
    }).then(function () {
      return migration.changeColumn('writingSessions', 'duration', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        comment: 'Duration of session in seconds'
      });
    }).then(function () {
      return migration.changeColumn('writingSessions', 'pausedTime', {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: 'Paused time of session in seconds'
      });
    }).then(function () {
      done();
    });
  }
  
};