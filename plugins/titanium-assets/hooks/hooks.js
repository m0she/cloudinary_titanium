// Generated by CoffeeScript 1.6.3
(function() {
  var asset_config, async, cleanFiles, coffeescript, compileFileType, compileFiles, copyStaticFiles, fs, less, path, spawn, utils, _;

  fs = require('fs');

  path = require('path');

  async = require('async');

  _ = require('underscore');

  spawn = require('child_process').spawn;

  coffeescript = require('coffee-script');

  less = require('less');

  compileFileType = require('./compile-file-type');

  utils = require('./utils');

  asset_config = require('./config').config;

  exports.build_pre_compile = function(logger, config, cli, build, finished) {
    var entry, inDir, name, outDir, projectDir, resourcesOutputDir;
    projectDir = build.projectDir || process.cwd();
    logger.info("Compiling source files at: " + projectDir);
    logger.info("Config: " + JSON.stringify(asset_config));
    resourcesOutputDir = projectDir + '/Resources';
    return async.parallel([
      function(cb) {
        var err;
        try {
          fs.mkdirSync(resourcesOutputDir);
        } catch (_error) {
          err = _error;
          if (!err || err.code !== 'EEXIST') {
            return cb(err);
          }
        }
        return cb(null);
      }
    ].concat((function() {
      var _i, _len, _ref, _ref1, _results;
      _ref = asset_config.compile_dirs || [];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        _ref1 = (function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = _.isArray(entry) ? entry : [entry, entry];
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            name = _ref1[_j];
            _results1.push(projectDir + '/' + name);
          }
          return _results1;
        })(), inDir = _ref1[0], outDir = _ref1[1];
        _results.push(function(cb) {
          logger.info("Compiling source files from: " + inDir + " to: " + outDir);
          return compileFiles(logger, inDir, outDir, cb);
        });
      }
      return _results;
    })()).concat((function() {
      var _i, _len, _ref, _ref1, _results;
      _ref = asset_config.static_dirs || [];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        _ref1 = (function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = _.isArray(entry) ? entry : [entry, entry];
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            name = _ref1[_j];
            _results1.push(projectDir + '/' + name);
          }
          return _results1;
        })(), inDir = _ref1[0], outDir = _ref1[1];
        _results.push(function(cb) {
          logger.info("Copying static files from: " + inDir + " to: " + outDir);
          return copyStaticFiles(logger, inDir, outDir, cb);
        });
      }
      return _results;
    })()), function(err) {
      if (err) {
        logger.error("Error compiling files: " + err);
        throw err;
      }
      logger.info('Finished compiling source files');
      return finished();
    });
  };

  exports.clean_post = function(logger, config, cli, build, finished) {
    var entry, outDir, resourcesOutputDir, _i, _len, _ref;
    console.log(cli.argv['project-dir']);
    resourcesOutputDir = cli.argv['project-dir'] + '/Resources';
    _ref = (config.compile_dirs || []).concat(config.static_dirs || []);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      entry = _ref[_i];
      if (!_.isArray(entry)) {
        return;
      }
      outDir = cli.argv['project-dir'] + '/' + entry[1];
      logger.info("Cleaning resources output directory: " + outDir);
      cleanFiles(outDir);
    }
  };

  copyStaticFiles = function(inputDir, outputDir, cb) {
    spawn('cp', ['-r', inputDir + '/', outputDir]);
    return cb(null);
  };

  compileFiles = function(logger, inputDir, outputDir, cb) {
    var compileFunctions;
    compileFunctions = _.map([
      {
        inSuffix: 'coffee',
        outSuffix: 'js',
        fnCompile: utils.funcAsAsync(function(code) {
          return coffeescript.compile(code, {
            bare: true
          });
        })
      }, {
        inSuffix: 'less',
        outSuffix: 'css',
        fnCompile: less.render
      }
    ], function(funcDef) {
      return function(cbCompile) {
        return compileFileType(logger, funcDef.fnCompile, inputDir, funcDef.inSuffix, outputDir, funcDef.outSuffix, cbCompile);
      };
    });
    return async.parallel(compileFunctions, function(err) {
      return cb(err);
    });
  };

  cleanFiles = function(outputDir, cb) {
    return spawn('rm', ['-r', outputDir + path.sep]);
  };

}).call(this);