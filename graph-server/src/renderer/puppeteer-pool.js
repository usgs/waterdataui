/**
 * This is a modified version of the puppeteer-pool project, which is not
 * usable in package form due to a hard dependency on an old version of
 * Puppeteer. puppeteer-pool is itself based on phantom-pool.
 * This version has been modified to remove usage of ES6 features.
 * https://github.com/latesh/puppeteer-pool
 */

const puppeteer = require('puppeteer');
const genericPool = require('generic-pool');


const initPuppeteerPool = function (opts) {
    const options = Object.assign({
        max: 10,
        // optional. if you set this, make sure to drain() (see step 3)
        min: 2,
        // specifies how long a resource can stay idle in pool before being removed
        idleTimeoutMillis: 30000,
        // specifies the maximum number of times a resource can be reused before being destroyed
        maxUses: 50,
        testOnBorrow: true,
        puppeteerArgs: [],
        validator: function () {
            return Promise.resolve(true);
        },
        otherConfig: {}
    }, opts);
    // TODO: randomly destroy old instances to avoid resource leak?
    const factory = {
        create: function () {
            return puppeteer.launch(options.puppeteerArgs).then(function (instance) {
                instance.useCount = 0;
                return instance;
            });
        },
        destroy: function (instance) {
            instance.close();
        },
        validate: function (instance) {
            return options.validator(instance).then(function (valid) {
                Promise.resolve(valid && (options.maxUses <= 0 || instance.useCount < options.maxUses));
            });
        }
    };
    const config = {
        max: options.max,
        min: options.min,
        idleTimeoutMillis: options.idleTimeoutMillis,
        testOnBorrow: options.testOnBorrow,
        otherConfig: options.otherConfig
    };
    const pool = genericPool.createPool(factory, config);
    const genericAcquire = pool.acquire.bind(pool);
    pool.acquire = function () {
        return genericAcquire().then(function (instance) {
            instance.useCount += 1;
            return instance;
        });
    };
    pool.use = function (fn) {
        let resource;
        return pool.acquire()
            .then(function (r) {
                resource = r;
                return resource;
            })
            .then(fn)
            .then(function (result) {
                pool.release(resource);
                return result;
            }, function (err) {
                pool.release(resource);
                throw err;
            });
    };

    return pool;
};

module.exports = initPuppeteerPool;
