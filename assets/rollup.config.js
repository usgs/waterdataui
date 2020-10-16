/**
 * Rollup configuration.
 * NOTE: This is a CommonJS module so it can be imported by Karma.
 */

const path = require('path');

const alias = require('@rollup/plugin-alias');
const buble = require('@rollup/plugin-buble');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const {uglify} = require('rollup-plugin-uglify');


const env = process.env.NODE_ENV || 'development';

const getBundleConfig = function(src, dest) {
    const hydrographEntries = [
        {find: 'ml', replacement: path.resolve(__dirname, 'src/scripts/monitoring-location')}
    ];
    const networkEntries = [
        {find: 'network', replacement: path.resolve(__dirname, 'src/scripts/network')}
    ];
    const entries = src === 'src/scripts/monitoring-location/index.js' ?  hydrographEntries : networkEntries;

    return {
        input: src,
        plugins: [
            alias({
                entries,
                customResolver: resolve.nodeResolve({
                    extensions: ['.js', '.json']
                })
            }),
            resolve.nodeResolve({
                mainFields: ['module', 'jsnext', 'main']
            }),
            json(),
            commonjs({
                exclude: [
                    'node_modules/symbol-observable/es/index.js'
                ]
            }),
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
        watch: {
            chokidar: false
        },
        output: {
            name: 'wdfn',
            file:  dest,
            format: 'iife',
            sourcemap: env !== 'production'
        },
        treeshake: env === 'production'
    };
};

module.exports = [
    getBundleConfig('src/scripts/monitoring-location/index.js', 'dist/bundle.js'),
    getBundleConfig('src/scripts/network/index.js', 'dist/network-bundle.js')
];


