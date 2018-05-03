const bodyParser = require('body-parser');
const express = require('express');
const expressValidator = require('express-validator');
const { checkSchema } = require('express-validator/check');

const { processSvg } = require('./image-util');
const { getSvg } = require('./impl/puppeteer');

let BUNDLES;

// Load the JS and CSS assets from the file system
require('./assets')().then(function (bundles) {
    BUNDLES = bundles;
}).catch(function (error) {
    console.error(error);
});


const PORT = process.env.NODE_PORT || 2929;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.listen(PORT, () => {
    console.log(`Graph server running on port ${PORT}`);
});


app.get('/monitoring-location/:siteID/', checkSchema({
    parameterCode: {
        in: ['query'],
        errorMessage: 'parameterCode (5 digit integer) is required',
        isInt: true,
        //toInt: true,
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
    }/*,
    startDate: {
        // TODO
    },
    endDate: {
        // TODO
    }*/
}), (req, res) => {
    const errors = req.validationErrors();
    if (errors) {
        res.status(400);
        res.send(errors);
        return;
    }

    /* to write a screenshot:
    const buffer = await page.screenshot();
    res.setHeader('Content-Type', 'image/png');
    res.write(buffer, 'binary');
    res.end(null, 'binary');
    */

    getSvg(BUNDLES, {
        siteID: req.params.siteID,
        parameterCode: req.query.parameterCode,
        compare: req.query.compare,
        serviceRoot: 'https://waterservices.usgs.gov/nwis',
        pastServiceRoot: 'https://nwis.waterservices.usgs.gov/nwis'
    })
    .then(processSvg.bind(null, BUNDLES.styles))
    .then((svgStr) => {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svgStr);
    })
    .catch(error => {
        console.log(error);
        res.status(500);
        res.send(error);
    });
});
