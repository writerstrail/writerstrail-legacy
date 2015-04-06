module.exports.generateImage = generateImage;

var http = require('http'),
  fs = require('fs'),
  qs = require('querystring');

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
