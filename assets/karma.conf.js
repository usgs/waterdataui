var istanbul = require('rollup-plugin-istanbul');


function isDebug(argument) {
    return argument === '--debug';
}

/**
 * Karma configuration for WDFN assets
 */

module.exports = function(config) {
    /**
     * Base configuration shared by all run configurations
     */
    let karmaConfig = {
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-ajax', 'jasmine'],

        client: {
          jasmine: {
            random: false
          }
        },

        // list of files / patterns to load in the browser
        files: [
            'tests/scripts/global-config.js',
            'node_modules/leaflet/dist/leaflet.js',
            'node_modules/esri-leaflet/dist/esri-leaflet.js',
            'node_modules/leaflet.markercluster/dist/leaflet.markercluster.js',
            {pattern: 'src/scripts/index.spec.js', watched: false}

        ],

        // list of files / patterns to exclude
        exclude: [
            'src/scripts/index.js',
            'src/scripts/networks/index.js'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/scripts/index.spec.js': ['rollup']
        },

        rollupPreprocessor: {
            /**
             * This is just a normal Rollup config object,
             * except that `input` is handled for you.
             */
            ...require('./rollup.config')[0]
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        browsers: ['FirefoxHeadless'],
        customLaunchers: getCustomLaunchers(),  /* eslint no-use-before-define: 0 */


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    };

    /**
     * Produce a code coverage report
     */
    if (!process.env.KARMA_SAUCE_LABS && !process.argv.some(isDebug)) {
        karmaConfig = {
            ...karmaConfig,
            rollupPreprocessor: {
                ...karmaConfig.rollupPreprocessor,
                plugins: [
                    ...karmaConfig.rollupPreprocessor.plugins,
                    istanbul({
                        exclude: [
                            'tests/**/*.js',
                            'src/scripts/**/*.spec.js',
                            'node_modules/**/*'
                        ]
                    })
                ]
            },
            reporters: [
                ...karmaConfig.reporters,
                'coverage'
            ],
            coverageReporter: {
                reporters: [
                    //{type: 'html', dir: 'coverage/'},
                    {type: 'cobertura', dir: 'coverage/'},
                    {type: 'lcovonly', dir: 'coverage/'}
                ]
            }
        };
    } else {
        console.log('Skipping code coverage report...');
    }



    /**
     * Add BrowserStack-specific settings
     */
    if (process.env.KARMA_BROWSERSTACK && process.env.BROWSER_STACK_USERNAME) {
        console.log('Using BrowserStack configuration...');
        karmaConfig = {
            ...karmaConfig,
            browserStack: {
                project: 'Water Data For The Nation',
                timeout: 1800
            },
            browserNoActivityTimeout: 120000,
            concurrency: 2,
            // These default browsers are chosen to prevent loss of browser
            // compatibility. As of May 15, 2018 they are the current oldest
            // supported.
            browsers: [
                ...karmaConfig.browsers,

                'bs_safarilatest_mac',
                'bs_edgelatest_windows10',
                // IE 11 failing with timezone issues
                //'bs_ie11_windows10',
                'bs_chromelatest_windows10',
                'bs_firefoxlatest_windows10'
            ]
        };
    }

    // If no browsers configured yet, default to Firefox.
    if (karmaConfig.browsers.length === 0) {
        console.log('Using Firefox...');
        karmaConfig = {
            ...karmaConfig,
            browsers: ['Firefox']
        };
    }

    config.set(karmaConfig);
};


function getCustomLaunchers() {
    return {
        FirefoxHeadless: {
            base: 'Firefox',
            flags: ['-headless']
        },
        /**
         * BrowserStack browsers
         * https://api.browserstack.com/automate/browsers.json
         */
        // Windows browsers
        bs_edgelatest_windows10: {
            base: 'BrowserStack',
            browser: 'edge',
            device: null,
            browser_version: 'latest',
            real_mobile: null,
            os: 'Windows',
            os_version: '10'
        },
        bs_ie11_windows10: {
            base: 'BrowserStack',
            browser: 'ie',
            browser_version: '11',
            os: 'windows',
            os_version: '10'
        },
        bs_firefoxlatest_windows10: {
            base: 'BrowserStack',
            browser: 'firefox',
            browser_version: 'latest',
            os: 'Windows',
            os_version: '10'
        },
        bs_chromelatest_windows10: {
            base: 'BrowserStack',
            browser: 'chrome',
            browser_version: 'latest',
            os: 'Windows',
            os_version: '10'
        },

        // OS X Browsers
        bs_safarilatest_mac: {
            base: 'BrowserStack',
            browser: 'safari',
            browser_version: 'latest',
            os: 'OS X',
            os_version: 'Mojave'
        }
    };
}