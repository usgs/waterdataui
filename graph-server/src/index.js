const bodyParser = require('body-parser');
const express = require('express');
var cache = require('express-cache-headers');
const expressValidator = require('express-validator');
const { checkSchema } = require('express-validator/check');

const renderToRespone = require('./renderer');


const PORT = process.env.NODE_PORT || 2929;
const CACHE_TIMEOUT = 15 * 60;  // 15 minutes


// Create the Express app
const app = express();

// Use to parse incoming request bodies
app.use(bodyParser.urlencoded({
    extended: false
}));

// Use for query parameter validation
app.use(expressValidator());

// Start the server
const server = app.listen(PORT, function () {
    console.log(`Graph server running on port ${PORT}`);
});

/**
 * Render hydrograph PNGs
 */
app.get('/monitoring-location/:siteID/', cache({ttl: CACHE_TIMEOUT}), checkSchema({
    renderer: {
    },
    parameterCode: {
        in: ['query'],
        errorMessage: 'parameterCode (5 digit integer) is required',
        isInt: true,
        isLength: {
            errorMessage: 'parameterCode should be 5 digits',
            options: {
                min: 5,
                max: 5
            }
        }
    },
    compare: {
        in: ['query'],
        optional: true,
        isBoolean: true,
        toBoolean: true
    }
}), function (req, res) {
    const errors = req.validationErrors();
    if (errors) {
        res.status(400);
        res.send(errors);
        return;
    }

    renderToRespone(res, {
        siteID: req.params.siteID,
        parameterCode: req.query.parameterCode,
        compare: req.query.compare
    });
});


module.exports = server;
