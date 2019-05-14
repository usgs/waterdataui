/**
 * Rollup configuration.
 * NOTE: This is a CommonJS module so it can be imported by Karma.
 */
const os = require('os');
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
            mainFields: ['module', 'jsnext', 'main']
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
            },
            numWorkers: Math.max(1, os.cpus().length - 1)
        })
    ],
    watch: {
        chokidar: false
    },
    output: {
        name: 'wdfn',
        file: 'dist/bundle.js',
        format: 'iife',
        sourcemap: env !== 'production'
    },
    treeshake: env === 'production'
};
