const autoprefixerOptions = {
    remove: false
};

module.exports = ctx => ({
    map: Object.assign({}, ctx.options.map, {inline: false}),
    parser: ctx.options.parser,
    plugins: {
        'autoprefixer': autoprefixerOptions,
        'postcss-csso': {
            forceMediaMerge: false
        },
        'postcss-flexbugs-fixes': {}
    }
});