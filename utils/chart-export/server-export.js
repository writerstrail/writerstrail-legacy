module.exports.generateImage = generateImage;
module.exports.buildChart = buildChart;

var http = require('http'),
  fs = require('fs'),
  qs = require('querystring'),
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
      fs.writeFile(file, Buffer.concat(buffer), function (err) {
        if (err) { return callback(err); }
        return callback(null, Buffer.concat(buffer));
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
