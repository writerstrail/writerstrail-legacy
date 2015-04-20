var projects = require('./projects');

module.exports = {
  id: 0,
  name: 'My Memoirs',
  count: 24000,
  unit: 'word',
  projects: projects,
  zoneOffset: 0,
  chartOptions: {
    wordcount: true,
    wordtarget: true
  }
};