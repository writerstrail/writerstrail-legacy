var dateFormats = require('./dateformats'),
  timeFormats = require('./timeformats'),
  chartTypes = require('./charttypes');

module.exports = {
  dateFormat: dateFormats.data[0],
  timeFormat: timeFormats.data[0],
  chartType: chartTypes[0],
  showRemaining: false,
  showAdjusted: false,
  showTour: false,
  defaultTimer: 900,
  performanceMetric: 'total'
};
