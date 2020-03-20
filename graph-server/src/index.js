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
 *
 * @swagger
 * /api/graph-images/monitoring-location/{siteID}/:
 *   get:
 *     description: Returns a graph of IV data for the site as a png. Default graph is for the last 7 days.
 *     parameters:
 *       - name: siteID
 *         in: path
 *         description: USGS site ID
 *         required: true
 *       - name: parameterCode
 *         in: query
 *         description: 5 digit string for the desired data
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 5
 *       - name: width
 *         in: query
 *         description: width in pixels
 *         schema:
 *           type: integer
 *           default: 1200
 *           maximum: 1200
 *           minimum: 300
 *       - name: title
 *         in: query
 *         description: adds the site name, site id and agency code to the title of the graph
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: compare
 *         in: query
 *         description: set to true to also draw last year's data - should not be used with period, startDT or endDT
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: period
 *         in: query
 *         description: ISO 8601 duration format in the form of PnD where n is a positive integer. Can't be used with startDT and endDT
 *         schema:
 *           type: string
 *           pattern: ^P([0-9]+)D$
 *       - name: startDT
 *         in: query
 *         description: ISO 8601 date format (YYYY-MM-DD). Must also use endDT and be before endDT
 *         schema:
 *           type: string
 *           pattern: ^([0-9]{4})-(1[0-2]|0[1-9])-(3[0-1]|[1-2][0-9]|0[1-9])$
 *       - name: endDT
 *         in: query
 *         description: ISO 8601 date format (YYYY-MM-DD). Must also use startDT and be after startDT
 *         schema:
 *           type: string
 *           pattern: ^([0-9]{4})-(1[0-2]|0[1-9])-(3[0-1]|[1-2][0-9]|0[1-9])$
 *     responses:
 *       200:
 *         description: PNG image of the IV data for the siteID and parameterCode
 *         content:
 *           image/png:
 *             examples: ''
 *       400:
 *         description: one or more of the query parameters did not validate
 *         content:
 *           application/json:
 *             examples: ''
 *
 *       404:
 *         description: Site does not exist
 *       500:
 *         description: The image could not be rendered, typically because a query parameter value is not available.
 *
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
