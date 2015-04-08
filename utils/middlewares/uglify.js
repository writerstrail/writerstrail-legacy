// Forked and fixed from https://github.com/bfrohs/UglifyJS-middleware
/*
 The MIT License (MIT)

 Copyright (c) 2013 Brandon Frohs

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var uglifyJS = require("uglify-js"),
  url = require("url"),
  path = require("path"),
  fs = require("fs"),
  minified = [];

var uglify = function (dir, localOptions) {

  if (!localOptions) {
    localOptions = {};
  }

  // Middleware
  return function (req, res, next) {

    // Only handle GET and HEAD requests
    if (req.method.toUpperCase() !== "GET" && req.method.toUpperCase() !== "HEAD") {
      return next();
    }

    // Get the filename
    var filename = url.parse(req.url).pathname;

    // Only handle .min.js requests
    if (filename.match(/\.min\.js$/)) {

      // Generate paths
      filename = filename.replace(/\.min\.js$/, "");
      var pathToMin = path.join(dir, filename + ".min.js");
      var pathToFull = path.join(dir, filename + ".js");

      // Ignore if there's no full file
      if (!fs.existsSync(pathToFull)) {
        return next();
      }

      var compile = function () {

        // Generate options for UglifyJS
        var options = {};

        if (localOptions.generateSourceMap) {
          options.outSourceMap = filename + ".map.js";
        }

        // Generate paths
        if (options.outSourceMap) {
          var pathToMap = path.join(dir, filename + ".map.js");
        }

        try {
          var uglified = uglifyJS.minify(pathToFull, options);
          fs.writeFile(pathToMin, uglified.code, function (err) {
            if (err) {
              next(err);
            }
            minified.push(pathToFull);

            // Write map to file
            if (pathToMap) {
              fs.writeFile(pathToMap, uglified.map, function (err) {
                next(err);
              });
            } else {
              next();
            }
          });
        } catch (err) {
          next(err);
        }
      };

      // If not yet minified, do so now
      if (!minified[pathToFull]) { return compile(); }

      // Compare mtimes
      fs.exists(pathToFull, function (exists) {
        if (!exists) {
          return next();
        } else {
          fs.stat(pathToFull, function (err, statsFull){
            if (err) {
              return next(err);
            }

            fs.exists(pathToMin, function (exists) {
              if (!exists) {
                return compile();
              } else {
                fs.stat(pathToMin, function (err, statsMin){
                  console.log('---stat', statsFull.mtime, statsMin.mtime);
                  if (err) {
                    return next(err);
                  } else if (statsFull.mtime > statsMin.mtime) {
                    return compile();
                  } else {
                    return next();
                  }
                });
              }
            });
          });
        }
      });
    } else {
      return next();
    }
  };
};

module.exports = uglify;
