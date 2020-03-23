const {version} = require('../package.json');
//TODO: put environment constants in their own module so they can be shared
const PATH_CONTEXT = process.env.PATH_CONTEXT || '/api/graph-images';

module.exports = {
    openapi: '3.0.0',
    info: {
        title: 'USGS Water Data Graph Image Service',
        version: version,
        description: 'API provides services which return a graph image as a png',
        contact: {
            name: 'Water USGS Feedback',
            url: 'https://water.usgs.gov/contact/gsanswers'
        },
        license: {
            name: 'CC0 1.0 Universal Summary',
            url: 'https://creativecommons.org/publicdomain/zero/1.0/legalcode'
        }
    },
    basePath: PATH_CONTEXT,
    apis: ['src/index.js']
};