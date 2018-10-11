/**
 * Rollup configuration.
 * NOTE: This is a CommonJS module so it can be imported by Karma.
 */
const path = require('path');

const alias = require('rollup-plugin-alias');
const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const { uglify } = require('rollup-plugin-uglify');


const env = process.env.NODE_ENV || 'development';

module.exports = {
    input: 'src/scripts/index.js',
    plugins: [
        alias({
            leaflet: path.resolve(__dirname, 'node_modules/leaflet/dist/leaflet-src.esm.js')
        }),
        resolve({
            // use "module" field for ES6 module if possible
            module: true, // Default: true

            // use "jsnext:main" if possible
            // – see https://github.com/rollup/rollup/wiki/jsnext:main
            jsnext: true,

            // use "main" field or index.js, even if it's not an ES6 module
            // (needs to be converted from CommonJS to ES6
            // – see https://github.com/rollup/rollup-plugin-commonjs
            main: true,  // Default: true

            // some package.json files have a `browser` field which
            // specifies alternative files to load for people bundling
            // for the browser. If that's you, use this option, otherwise
            // pkg.browser will be ignored
            browser: false  // Default: false
        }),
        json(),
        commonjs(),
        buble({
            objectAssign: 'Object.assign',
            transforms: {
                dangerousForOf: true
            }
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify(env)
        }),
        env === 'production' && uglify({
            compress: {
                dead_code: true,
                drop_console: true
            }
        })
    ],
    output: {
        name: 'wdfn',
        file: 'dist/bundle.js',
        format: 'iife',
        sourcemap: env !== 'production'
    },
    treeshake: env === 'production'
};
