var http = require('http'),
  path = require('path'),
  fs = require('fs'),
  qs = require('querystring'),
  chart = require('./chart1.json'),
  options = {
    hostname: 'export.highcharts.com',
    port: 80,
    path: '/',
    method: 'POST',
    headers: {
      accept: 'image/png',
      'content-type': 'application/x-www-form-urlencoded'
    }
  },
  file = path.join(__dirname, 'chart1.png'),
  req;

if (fs.existsSync(file)) {
  fs.unlinkSync(file);
}

req = http.request(options, function (res) {
  res.on('data', function (chunk) {
    fs.appendFileSync(file, chunk);
  });
});

req.end(qs.stringify({
  options: JSON.stringify(chart),
  type: 'image/png',
  filename: 'chart.png',
  width: 1000
}));
