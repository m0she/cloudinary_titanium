// Generated by CoffeeScript 1.6.3
(function() {
  var async, fs, path, _,
    __slice = [].slice;

  fs = require('fs');

  path = require('path');

  async = require('async');

  _ = require('underscore');

  exports.mkdirs = function(mkpath, cb) {
    var currentPath, paths;
    mkpath = path.relative(process.cwd(), mkpath);
    paths = mkpath.split(path.sep);
    currentPath = '';
    return async.eachSeries(paths, function(pathPart, cb) {
      return fs.mkdir(path.join(currentPath, pathPart), function(err) {
        if (err && err.code !== 'EEXIST') {
          return cb(err);
        }
        currentPath = path.join(currentPath, pathPart);
        return cb(null);
      });
    }, function(err) {
      return cb(err);
    });
  };

  exports.findFiles = function(dir, fnMatch, cb) {
    var results;
    results = {};
    return fs.readdir(dir, function(err, files) {
      var file, remaining, _i, _len, _results;
      if (err) {
        return cb(err);
      }
      remaining = files.length;
      if (remaining === 0) {
        return cb(null, results);
      } else {
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          _results.push((function() {
            var curPath;
            curPath = path.join(dir, file);
            return fs.stat(curPath, function(err, stat) {
              if (stat) {
                if (stat.isDirectory()) {
                  return exports.findFiles(curPath, fnMatch, function(err, subdirResults) {
                    results = _.extend(results, subdirResults);
                    if (--remaining === 0) {
                      return cb(null, results);
                    }
                  });
                } else {
                  if (!fnMatch || fnMatch(curPath)) {
                    results[curPath] = stat;
                  }
                  if (--remaining === 0) {
                    return cb(null, results);
                  }
                }
              }
            });
          })());
        }
        return _results;
      }
    });
  };

  exports.stringEndsWidth = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) > -1;
  };

  exports.funcAsAsync = function(func) {
    return function() {
      var cb, err, params, result;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      cb = _.last(params);
      result = func.apply(this, params.slice(0, -1));
      try {
        return cb(null, result);
      } catch (_error) {
        err = _error;
        return cb(new Error("" + func.name + " failed: " + err));
      }
    };
  };

}).call(this);
