const express = require('express');
const cache = require('express-cache-headers');
const { checkSchema, validationResult } = require('express-validator');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const { version } = require('../package.json');
const renderToResponse = require('./renderer');


const PORT = process.env.NODE_PORT || 2929;
const CACHE_TIMEOUT = 15 * 60;  // 15 minutes
const PATH_CONTEXT = process.env.PATH_CONTEXT || '/api/graph-images';


// Create the Express app
const app = express();

// Start the server
const server = app.listen(PORT, function () {
    console.log(`Graph server running on port ${PORT}`);
});

app.use(`${PATH_CONTEXT}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * Render hydrograph PNGs
 */
app.get(`${PATH_CONTEXT}/monitoring-location/:siteID/`, cache({ttl: CACHE_TIMEOUT}), checkSchema({
    parameterCode: {
        in: ['query'],
        errorMessage: 'parameterCode (5 digit string) is required',
        isInt: true,
        isLength: {
            errorMessage: 'parameterCode should be 5 digits',
            options: {
                min: 5,
                max: 5
            }
        }
    },
    width: {
        in: ['query'],
        errorMessage: 'width should be an integer between 300 and 1200',
        optional: true,
        isInt: {
            options: {
                min: 300,
                max: 1200
            }
        },
        toInt: true,

    },
    compare: {
        in: ['query'],
        optional: true,
        isBoolean: true,
        toBoolean: true
    },
    title: {
        in: ['query'],
        optional: true,
        isBoolean: true,
        toBoolean: true
    },
    startDT: {
        in: ['query'],
        optional: true,
        toDate: true,
        isISO8601: 'yyyy-mm-dd',
        errorMessage: 'The startDT must be a date'
    },
    endDT: {
        in: ['query'],
        optional: true,
        toDate: true,
        isISO8601: 'yyyy-mm-dd',
        custom: {
            options: (value, { req }) => value > req.query.startDT,
            errorMessage: 'endDT must be after the startDT'
        },
        errorMessage: 'The endDT must be a date'
    }
}), function (req, res) {
    const errors = validationResult(req).array();

    if (errors.length > 0) {
        res.status(400);
        res.send(errors);
        return;
    }

    renderToResponse(res, {
        siteID: req.params.siteID,
        parameterCode: req.query.parameterCode,
        compare: req.query.compare,
        period: req.query.period,
        startDT: req.query.startDT,
        endDT: req.query.endDT,
        showMLName: req.query.title || false,
        width: req.query.width ? req.query.width : 1200
    });
});

app.get(`${PATH_CONTEXT}/status`, function (req, res) {
    res.status(200);
    res.send({
        version: version
    });
});

module.exports = server;
