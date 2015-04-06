module.exports.generateImage = generateImage;
module.exports.buildChart = buildChart;
module.exports.isFresh = isFresh;
module.exports.isSame = isSame;

var http = require('http'),
  fs = require('fs'),
  path = require('path'),
  qs = require('querystring'),
  moment = require('moment'),
  mkdirp = require('../functions/mkdirp'),
  chart = require('../../public/scripts/chart');

function generateImage(file, data, callback) {

  var options = {
      hostname: 'export.highcharts.com',
      port: 80,
      path: '/',
      method: 'POST',
      headers: {
        accept: 'image/png',
        'content-type': 'application/x-www-form-urlencoded'
      }
    },
    req,
    buffer = [];

  req = http.request(options, function (res) {
    res.on('data', function (chunk) {
      buffer.push(chunk);
    });
    res.on('end', function () {
      mkdirp(path.dirname(file), undefined, function () {
        fs.writeFile(file, Buffer.concat(buffer), function (err) {
          if (err) {
            return callback(err);
          }
          fs.writeFileSync(file + '.json', JSON.stringify(data), { encoding: 'utf8'});
          return callback(null, Buffer.concat(buffer));
        });
      });
    });
  });

  req.on('error', callback);

  req.end(qs.stringify({
    options: JSON.stringify(data),
    type: 'image/png',
    filename: 'chart.png',
    width: 1000
  }));
}

function buildChart(object, unit, settings, data) {
  var isAcc = settings.chartType === 'cumulative',
    series = chart.buildMeta(data, isAcc, settings.showRemaining, settings.showAdjusted, unit);

  return chart.chartOptions(series, settings.chartType, settings.showRemaining,
    settings.showAdjusted, unit, object.name);
}

function isFresh(file) {
  var stats, diff;
  try {
    stats = fs.statSync(file);
  } catch (e) {
    if (e.errno === 34) {
      return false;
    }
    throw e;
  }
  diff = moment().diff(stats.mtime, 'hours');

  return diff <= 4;
}

function isSame(file, data) {
  var storedData, same;

  try {
    storedData = fs.readFileSync(file + '.json', {encoding: 'utf8'});
  } catch (e) {
    if (e.errno === 34) {
      return false;
    }
    throw e;
  }

  same = storedData === JSON.stringify(data);

  if (same) {
    var now = new Date();
    fs.utimes(file, now, now);
  }
  return same;
}
