const bodyParser = require('body-parser');
const express = require('express');
const expressValidator = require('express-validator');
const { checkSchema } = require('express-validator/check');

const renderToRespone = require('./renderer');


const PORT = process.env.NODE_PORT || 2929;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

const server = app.listen(PORT, () => {
    console.log(`Graph server running on port ${PORT}`);
});


app.get('/monitoring-location/:siteID/', checkSchema({
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

    renderToRespone(res, {
        renderer: req.query.renderer,
        siteID: req.params.siteID,
        parameterCode: req.query.parameterCode,
        compare: req.query.compare
    });
});


module.exports = server;
