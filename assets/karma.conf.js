// Karma configuration
// Generated on Wed Dec 27 2017 10:17:29 GMT-0600 (CST)
var proxyquire = require('proxyquireify');
var browserifyBabalIstanbul = require('browserify-babel-istanbul');
var isparta = require('isparta');

function isDebug(argument) {
    return argument === '--debug';
}


module.exports = function (config) {
    let karmaConfig = {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'jasmine-ajax', 'jasmine'],

        // list of files / patterns to load in the browser
        files: [
            //'node_modules/babel-polyfill/dist/polyfill.min.js',
            'tests/scripts/globalConfig.js',
            'src/scripts/**/*.js'
        ],


        // list of files / patterns to exclude
        exclude: [
            'src/scripts/index.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/scripts/**/*.js': ['browserify']
        },
        browserify: {
            debug: true,
            configure: function (bundle) {
                bundle
                    .plugin(proxyquire.plugin)
                    .require(require.resolve('./src/scripts'), {entry: true});
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
    };

    // Add BrowserStack-specific settings
    if (process.env.KARMA_BROWSERSTACK && process.env.BROWSER_STACK_USERNAME) {
        karmaConfig = {
            ...karmaConfig,
            browserStack: {
                project: 'Water Data For The Nation'
            },
            customLaunchers: {
                // Windows browsers
                bs_ie11_windows10: {
                    base: 'BrowserStack',
                    browser: 'ie',
                    browser_version: '11',
                    os: 'windows',
                    os_version: '10'
                },
                bs_ie9_windows7: {
                    base: 'BrowserStack',
                    browser: 'ie',
                    browser_version: '9',
                    os: 'windows',
                    os_version: '7'
                },
                bs_firefox_windows10: {
                    base: 'BrowserStack',
                    browser: 'firefox',
                    browser_version: '48.0',
                    os: 'Windows',
                    os_version: '10'
                },

                // OS X Browsers
                bs_firefox_mac: {
                    base: 'BrowserStack',
                    browser: 'firefox',
                    browser_version: '48.0',
                    os: 'OS X',
                    os_version: 'Mountain Lion'
                },
                bs_safari8_mac: {
                    base: 'BrowserStack',
                    browser: 'safari',
                    browser_version: '10.2',
                    os: 'OS X',
                    os_version: 'Yosemite'
                },

                // iOS browsers
                bs_iphone5: {
                    base: 'BrowserStack',
                    device: 'iPhone 5',
                    os: 'ios',
                    os_version: '6.0'
                },

                // Android browsers
                'bs_galaxys5_44': {
                    base: 'BrowserStack',
                    browser_version: 'latest',
                    os: 'android',
                    os_version: '4.4',
                    device: 'Samsung Galaxy S5'
                }
            },
            concurrency: 2,
            browsers: ['bs_firefox_mac']
        };
    } else {
        console.log('Skipping BrowserStack configuration...');
    }

    config.set(karmaConfig);

    if (process.argv.some(isDebug)) {
        config.set({
            browserify: {
                debug: true,
                configure: function (bundle) {
                    bundle
                        .plugin(proxyquire.plugin)
                        .require(require.resolve('./src/scripts'), {entry: true});
                }
            }
        });
    } else {
        config.set({
            browserify: {
                configure: function (bundle) {
                    bundle
                        .plugin(proxyquire.plugin)
                        .require(require.resolve('./src/scripts'), {entry: true});
                },
                transform: [browserifyBabalIstanbul({
                    instrumenter: isparta,
                    instrumenterConfig: {babel: {presets: ['env']}},
                    ignore: ['**/lib/**', '**/*.spec.js']
                })]
            }
        });
    }
};
