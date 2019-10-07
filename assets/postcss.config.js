const autoprefixerOptions = [
    '>2%',
    'Last 2 versions',
    'IE 11'
];

module.exports = ctx => ({
    map: Object.assign({}, ctx.options.map, {inline: false}),
    parser: ctx.options.parser,
    plugins: {
        autoprefixer: autoprefixerOptions,
        cssnano: {
            autoprefixer: {
                browsers: autoprefixerOptions
            }
        },
        'css-mqpacker': {
            sort: true
        },
        'postcss-flexbugs-fixes': {}
    }
});