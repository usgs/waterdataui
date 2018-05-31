
/**
 * Karma configuration for WDFN assets
 */

module.exports = function (config) {
    /**
     * Base configuration shared by all run configurations
     */
    let karmaConfig = {
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-ajax', 'jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'tests/scripts/globalConfig.js',
            'src/scripts/index.spec.js'
        ],

        // list of files / patterns to exclude
        exclude: [
            'src/scripts/index.js'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/scripts/**/*.js': ['rollup']
        },

        rollupPreprocessor: {
            /**
             * This is just a normal Rollup config object,
             * except that `input` is handled for you.
             */
            ...require('./rollup.config')
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        customLaunchers: getCustomLaunchers(),  /* eslint no-use-before-define: 0 */
        browsers: [],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    };

    /**
     * Produce a code coverage report
     * This interferes with karma-sauce-launcher
     */
    if (!process.env.KARMA_SAUCE_LABS) {
        karmaConfig = {
            ...karmaConfig,
            reporters: [
                ...karmaConfig.reporters
                //'coverage'
            ],

            coverageReporter: {
                reporters: [
                    {type: 'html', dir: 'coverage/'},
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

                'bs_safari10_mac',
                'bs_safari10_iphone7',
                'bs_edge16_windows10',
                // IE 11 failing with timezone issues
                //'bs_ie11_windows10',
                'bs_chrome52_windows10',
                'bs_firefox52_windows10'
                // Galaxy browser times out trying to connect
                //'bs_galaxys8_chrome52'
            ]
        };
    }

    if (process.env.KARMA_SAUCE_LABS) {
        console.log('Using Open Sauce configuration...');
        karmaConfig = {
            ...karmaConfig,
            sauceLabs: {
                testName: 'WDFN Unit Tests',
                recordScreenshots: false,
                captureTimeout: 120000
            },
            browserNoActivityTimeout: 120000,
            reporters: [
                ...karmaConfig.reporters,
                'saucelabs'
            ],
            browsers: [
                ...karmaConfig.browsers,

                'sl_safari10_mac',
                'sl_safari10_iphone7',  // two tests failing
                'sl_edge16_windows10',
                'sl_ie11_windows10',  // IE 11 failing with timezone issues
                'sl_chrome52_windows10',
                'sl_firefox52_windows10',
                'sl_galaxys3_android'
            ],
            concurrency: 5,
            startConnect: false
        };

        // TravisCI handles starting the SauceConnect daemon for us
        if (process.env.TRAVIS_JOB_NUMBER) {
            karmaConfig = {
                ...karmaConfig,
                sauceLabs: {
                    ...karmaConfig.sauceLabs,
                    startConnect: false,
                    tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
                }
            };
        }
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
        /**
         * BrowserStack browsers
         * https://api.browserstack.com/automate/browsers.json
         */
        // Windows browsers
        bs_edge16_windows10: {
            base: 'BrowserStack',
            browser: 'edge',
            browser_version: '16.0',
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
        bs_ie11_windows81: {
            base: 'BrowserStack',
            browser: 'ie',
            browser_version: '11',
            os: 'windows',
            os_version: '8.1'
        },
        bs_ie9_windows7: {
            base: 'BrowserStack',
            browser: 'ie',
            browser_version: '9',
            os: 'windows',
            os_version: '7'
        },
        bs_firefox48_windows10: {
            base: 'BrowserStack',
            browser: 'firefox',
            browser_version: '48.0',
            os: 'Windows',
            os_version: '10'
        },
        bs_firefox52_windows10: {
            base: 'BrowserStack',
            browser: 'firefox',
            browser_version: '52.0',
            os: 'Windows',
            os_version: '10'
        },
        bs_firefox51_windows10: {
            base: 'BrowserStack',
            browser: 'firefox',
            browser_version: '51.0',
            os: 'Windows',
            os_version: '10'
        },
        bs_chrome59_windows10: {
            base: 'BrowserStack',
            browser: 'chrome',
            browser_version: '59.0',
            os: 'Windows',
            os_version: '10'
        },
        bs_chrome58_windows10: {
            base: 'BrowserStack',
            browser: 'chrome',
            browser_version: '58.0',
            os: 'Windows',
            os_version: '10'
        },
        bs_chrome55_windows10: {
            base: 'BrowserStack',
            browser: 'chrome',
            browser_version: '55.0',
            os: 'Windows',
            os_version: '10'
        },
        bs_chrome52_windows10: {
            base: 'BrowserStack',
            browser: 'chrome',
            browser_version: '52.0',
            os: 'Windows',
            os_version: '10'
        },
        bs_chrome51_windows10: {
            base: 'BrowserStack',
            browser: 'chrome',
            browser_version: '51.0',
            os: 'Windows',
            os_version: '10'
        },
        bs_chrome50_windows10: {
            base: 'BrowserStack',
            browser: 'chrome',
            browser_version: '50.0',
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
            browser_version: '8',
            os: 'OS X',
            os_version: 'Yosemite'
        },
        bs_safari9_mac: {
            base: 'BrowserStack',
            browser: 'safari',
            browser_version: '9.1',
            os: 'OS X',
            os_version: 'El Capitan'
        },
        bs_safari10_mac: {
            base: 'BrowserStack',
            browser: 'safari',
            browser_version: '10.0',
            os: 'OS X',
            os_version: 'Sierra'
        },
        bs_safari11_mac: {
            base: 'BrowserStack',
            browser: 'safari',
            browser_version: '11.1',
            os: 'OS X',
            os_version: 'High Sierra'
        },

        // iOS browsers
        bs_safari10_iphone7: {
            base: 'BrowserStack',
            browser: 'safari',
            browser_version: '10.0',
            device: 'iPhone 7',
            os: 'ios',
            os_version: '10.0'
        },
        bs_iphone5s: {
            base: 'BrowserStack',
            browser: 'safari',
            device: 'iPhone 5S',
            os: 'ios',
            os_version: '7.0'
        },
        bs_iphone5: {
            base: 'BrowserStack',
            browser: 'safari',
            device: 'iPhone 5',
            os: 'ios',
            os_version: '6.0'
        },

        // Android browsers
        bs_galaxys8_chrome52: {
            base: 'BrowserStack',
            browser: 'chrome',
            browser_version: '52',
            device: 'Samsung Galaxy S8',
            os: 'android',
            os_version: '7.0',
            real_mobile: true
        },
        bs_pixel_android: {
            base: 'BrowserStack',
            browser: 'android',
            browser_version: null,
            device: 'Google Pixel',
            os: 'android',
            os_version: '8.0',
            real_mobile: true
        },


        /**
         * SauceLabs browserse
         */
        // OS X Browsers
        sl_safari10_mac: {
            base: 'SauceLabs',
            platform: 'OS X 10.12',
            browserName: 'Safari',
            version: '10.1'
        },

        // Windows Browseres
        sl_chrome52_windows10: {
            base: 'SauceLabs',
            platform: 'Windows 10',
            browserName: 'chrome',
            version: '52.0'
        },
        sl_edge16_windows10: {
            base: 'SauceLabs',
            platform: 'Windows 10',
            browserName: 'MicrosoftEdge',
            version: '16.16299'
        },
        sl_ie11_windows10: {
            base: 'SauceLabs',
            platform: 'Windows 10',
            browserName: 'internet explorer',
            version: '11.103'
        },
        sl_firefox52_windows10: {
            base: 'SauceLabs',
            platform: 'Windows 10',
            browserName: 'firefox',
            version: '52.0'
        },

        // iOS browsers
        sl_safari10_iphone7: {
            base: 'SauceLabs',
            appiumVersion: '1.8.0',
            deviceName: 'iPhone 7 Simulator',
            deviceOrientation: 'portrait',
            platformVersion: '10.0',
            platformName: 'iOS',
            browserName: 'Safari'
        },

        // Android browsers
        sl_galaxys3_android: {
            base: 'SauceLabs',
            browserName: 'Browser',
            platform: 'Android',
            version: '4.4',
            deviceName: 'Samsung Galaxy S3 Emulator',
            deviceOrientation: 'portrait'
        }
    };
}
