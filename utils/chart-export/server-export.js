module.exports.generateImage = generateImage;
module.exports.buildChart = buildChart;
module.exports.isFresh = isFresh;
module.exports.isSame = isSame;
module.exports.middleware = middleware;
module.exports.deleteImage = deleteImage;

var http = require('http'),
  fs = require('fs'),
  path = require('path'),
  qs = require('querystring'),
  moment = require('moment'),
  _ = require('lodash'),
  env = process.env.NODE_ENV || 'development',
  config = require('../../config/config')[env],
  models = require('../../models'),
  mkdirp = require('../functions/mkdirp'),
  anon = require('../data/anonuser'),
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
    series = chart.buildMeta(data, isAcc, settings.showRemaining, settings.showAdjusted, unit, true);

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

function middleware(model, chartData) {
  var dir = model.toLowerCase() + 's';

  return function (req, res) {
    res.type('image/png');
    var types = ['cumulative', 'daily'],
      file,
      object;
    if (_.indexOf(types, req.params.type) < 0) {
      return res.status(404).end();
    }

    function serveImage(err, image) {
      if (err) {
        console.log(err);
        return res.status(500).end();
      }
      return res.send(image).end();
    }

    function createImage(err, data) {
      if (err) {
        console.log(err);
        return res.status(500).end();
      }

      var settings = _.defaults({}, {
          chartType: req.params.type
        }, anon.settings),
        chart = buildChart(object, object.unit, settings, data);

      if (isSame(file, chart)) {
        return res.sendFile(file);
      }

      generateImage(file,
        chart,
        serveImage
      );
    }

    models[model].findOne({
      where: {
        id: req.params.id
      },
      attributes: ['id', 'name', 'public']
    }).then(function (o) {
      if (!o || !o.public) {
        return res.status(404).end();
      }

      object = o;

      file = path.join(config.imagesdir, 'charts', dir, req.params.id + '_' + req.params.type + '.png');

      if (isFresh(file)) {
        return res.sendFile(file, {
          maxAge: 5 * 36e5 // 5 hours
        });
      }

      chartData(req, createImage);

    });
  };
}

function deleteImage(model, id, callback) {
  var dir = model.toLowerCase() + 's',
    fileBase = path.join(config.imagesdir, 'charts', dir, id + '_'),
    daily = fileBase + 'daily.png',
    acc = fileBase + 'cumulative.png',
    errs = [];

  function unlinkDaily(callback) {
    fs.unlink(daily, function (err) {
      if (err && err.errno !== 34) {
        errs.push(err);
      }
      fs.unlink(daily + '.json', callback);
    });
  }

  function unlinkAcc(callback) {
    fs.unlink(acc, function (err) {
      if (err && err.errno !== 34) {
        errs.push(err);
      }
      fs.unlink(acc + '.json', callback);
    });

  }

  unlinkDaily(unlinkAcc.bind(null, function () {
    if (errs.length) {
      callback(errs);
    } else {
      callback();
    }
  }));
}
