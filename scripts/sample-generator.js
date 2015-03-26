#!/usr/bin/env node
/********

This script generates a bunch of random data into a new sample user.
It such user exists, it'll be deleted (which cascades to delete everything
it owns) and then recreated.

run with:
    node scripts/sample-generator.js

The process works roughly like this:

  * Drop existing sample user.
  * Create sample user (this creates settings and genres).
  * Create sample projects.
    * These projects have a `totalWordcount` value, which
      does not got to database and is used to keep the currentWordcount
      of such project within a certain percentage boundary.
  * Associate each project to a random genre.
  * Create a date one year ago.
  * For each day from this date until today:
    * Create a random number of sessions (between min-max boundaries).
    * Distribute these sessions to the existing projects that still has wordcount to fill

Still have to decide how to make random targets.

**** Types of projects (2 of each):

  * Not started (0 currentWordcount).
  * Started, but no session (starting wordcount == currentWordcount).
  * With sessions, but not finished (currentWordcount < targetwc).
  * With sessions and finished (currentWordcount == targetwc).
  * Finished and archived (active == false).

*/

var promise = require('bluebird'),
    faker = require('faker'),
    moment = require('moment'),
    _ = require('lodash'),
    models = require('../models'),
    userData = {
      name: 'Sample user',
      email: 'sampleuser@example.com',
      verifiedEmail: 'sampleuser@example.com',
      password: 'sampleuserpass',
      activated: true,
      verified: true,
      lastAccess: new Date()
    },
    projectsData = [],
    wordcountRange = [90000, 30000], // min, variation
    durationRange = [300, 1200], // min, max
    wpmRange = [30, 50], // min, max
    yearAgo = moment().subtract({ year: 1, day: 1 }).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }),
    today = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }),
    user,
    genres,
    projects;

function randomIntBetween(min, max) {
  return Math.floor(Math.random() * max) + min;
}

(function generateProjects() {
  function randomNumber() {
    return faker.random.number(wordcountRange[0]) + wordcountRange[1];
  }
  projectsData = [
    { // Not started 1
      name: 'Ender\'s Game',
      wordcount: 0,
      targetwc: randomNumber(),
      totalWordcount: 0,
      active: true,
      finished: false
    },
    { // Not started 2
      name: 'The Hobbit',
      wordcount: 0,
      targetwc: randomNumber(),
      totalWordcount: 0,
      active: true,
      finished: false
    },
    { // Started, no session 1
      name: 'Pride and Prejudice',
      wordcount: 42342,
      targetwc: randomNumber(),
      totalWordcount: 0,
      active: true,
      finished: false
    },
    { // Started, no session 2
      name: 'Brave New World',
      wordcount: 23434,
      targetwc: randomNumber(),
      totalWordcount: 0,
      active: true,
      finished: false
    },
    { // With sessions 1
      name: 'The Adventures of Tom Sawyer',
      wordcount: 0,
      targetwc: randomNumber(),
      totalWordcount: 30, // percentage of target
      active: true,
      finished: false
    },
    { // With sessions 2
      name: 'Under the Dome',
      wordcount: 0,
      targetwc: randomNumber(),
      totalWordcount: 71, // percentage of target
      active: true,
      finished: false
    },
    { // Finished 1
      name: 'Fahrenheit 451',
      wordcount: 0,
      targetwc: randomNumber(),
      totalWordcount: 100, // percentage of target
      active: true,
      finished: true
    },
    { // Finished 2
      name: 'The Great Gatsby',
      wordcount: 0,
      targetwc: randomNumber(),
      totalWordcount: 155, // percentage of target
      active: true,
      finished: true
    },
    { // Archived 1
      name: 'The Picture of Dorian Gray',
      wordcount: 0,
      targetwc: randomNumber(),
      totalWordcount: Infinity, // doesn't matter
      active: false,
      finished: true
    },
    { // Archived 2
      name: '20000 Leagues Under the Sea',
      wordcount: 0,
      targetwc: randomNumber(),
      totalWordcount: Infinity, // doesn't matter
      active: false,
      finished: true
    }
  ];

  // Now generates the totalWordcount based on percentage
  projectsData.forEach(function (p) {
    p.description = faker.hacker.phrase();
    if (isFinite(p.totalWordcount)) {
      p.totalWordcount = Math.floor((p.targetwc  / 100) * p.totalWordcount);
    }
  });

})();

models.User.destroy({
  where: {
    email: userData.email
  },
  force: true
}).then(function () {
  return models.User.create(userData);
}).then(function () {
  return models.User.findOne({
    where: {
      email: userData.email
    }
  });
}).then(function (u) {
  user = u;
  return models.Genre.findAll({
    where: {
      ownerId: user.id
    }
  });
}).then(function (gs) {
  genres = gs;
  projectsData.forEach(function (p) {
    p.ownerId = user.id;
  });
  return models.Project.bulkCreate(projectsData);
}).then(function () {
  return user.getProjects();
}).then(function (ps) {
  var promises = [];
  projects = ps;
  projects.forEach(function (p) {
    _.findWhere(projectsData, { name: p.name }).id = p.id;
    promises.push(p.addGenre(genres[Math.floor(Math.random() * genres.length)]));
  });

  return promise.all(promises);
}).then(function () {

  // Generate sessions

  function selectProject() {
    return _.findWhere(_.shuffle(projectsData), function (p) {
      if (!p.active) { return true; }
      if (p.totalWordcount > 0) { return true; }
      return !p.active;
    });
  }

  function randomTime(day) {
    return moment(day).set({
      hour: randomIntBetween(0, 23),
      minute: randomIntBetween(0, 59),
      second: randomIntBetween(0, 59)
    });
  }

  return models.sequelize.transaction(function () {
    var promises = [];

    while (today.isAfter(yearAgo)) {
      var amount = faker.random.number(6); // between 0 and 5

      for (var i = 0; i < amount; i++) {
        var project = selectProject(),
            wpm = (Math.random() * wpmRange[1]) + wpmRange[0],
            duration = (Math.random() * durationRange[1]) + durationRange[0],
            wordcount = Math.min(Math.floor(wpm * (duration / 60)), project.totalWordcount);

        project.totalWordcount -= wordcount;

        promises.push(models.Session.create({
          summary: faker.hacker.phrase(),
          start: randomTime(today).toDate(),
          duration: duration,
          pausedTime: randomIntBetween(0, Math.floor(duration / 6)),
          wordcount: wordcount,
          projectId: project.id,
          isCountdown: !!faker.random.number(),
          zoneOffset: today.utcOffset()
        }));
      }

      today.subtract(1, 'day');
    }

    return promise.all(promises);
  });
}).then(function () {
  console.log('Done.');
  process.exit(0);
}).catch(function (err) {
  console.log(err);
  console.log(err.stack);
  process.exit(1);
});
