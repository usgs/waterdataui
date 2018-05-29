import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';


export default {
    input: 'src/scripts/index.js',
    plugins: [
        resolve(),
        commonjs(),
        buble({
            objectAssign: 'Object.assign',
            transforms: {
                dangerousForOf: true
            }
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        !process.env.ROLLUP_WATCH && uglify
    ],
    output: {
        file: 'dist/bundle.js',
        format: 'iife',
        sourcemap: process.env.ROLLUP_WATCH
    },
    treeshake: !process.env.ROLLUP_WATCH
};
