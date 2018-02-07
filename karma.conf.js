// Karma configuration
// Generated on Wed Dec 27 2017 10:17:29 GMT-0600 (CST)
var proxyquire = require('proxyquireify');
module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'assets/src/scripts/**/*.js'
    ],


    // list of files / patterns to exclude
    exclude: [
        'assets/src/scripts/index.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'assets/src/scripts/**/!(*.spec).js': ['coverage'],
        'assets/src/scripts/**/*.js': ['browserify']
    },
      browserify: {
        debug: true,
          configure: function(bundle) {
            bundle
                .plugin(proxyquire.plugin)
                .require(require.resolve('./assets/src/scripts'), { entry: true });
          }
      },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'coverage'],

    coverageReporter: {
        reporters: [
            {type: 'html', dir: 'coverage/'},
            {type: 'cobertura', dir: 'coverage/'},
            {type: 'lcovonly', dir: 'coverage/'}
        ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
