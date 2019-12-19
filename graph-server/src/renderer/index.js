const renderPNG = require('./render-png');

const SERVICE_ROOT = process.env.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';
const PAST_SERVICE_ROOT = process.env.PAST_SERVICE_ROOT || 'https://nwis.waterservices.usgs.gov/nwis';
const STATIC_ROOT = process.env.STATIC_ROOT || 'https://waterdata.usgs.gov/nwisweb/wsgi/static';


const renderToRespone = function (res, {siteID, parameterCode, compare, period}) {
    const componentOptions = {
        siteno: siteID,
        parameter: parameterCode,
        compare: compare,
        period: period,
        cursorOffset: false,
        showOnlyGraph : true,
        showMLName: true
    };
    renderPNG({
        pageURL: 'http://wdfn-graph-server',
        pageContent: `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <script>
                        var CONFIG = {
                            SERVICE_ROOT: '${SERVICE_ROOT}',
                            PAST_SERVICE_ROOT: '${PAST_SERVICE_ROOT}',
                            MULTIPLE_TIME_SERIES_METADATA_SELECTOR_ENABLED: false,
                            STATIC_URL: '${STATIC_ROOT}'
                        };
                    </script>
                    <link rel="stylesheet" href="${STATIC_ROOT}/main.css">
                    <script src="${STATIC_ROOT}/bundle.js"></script>
                </head>
                <body>
                    <div class="wdfn-component" data-component="hydrograph" data-options='${JSON.stringify(componentOptions)}'>
                        <div class="graph-container"></div>
                    </div>
                </body>
            </html>`,
        viewportSize: {
            width: 1200,
            height: 1200
        },
        componentOptions
    }).then(function (buffer) {
        res.setHeader('Content-Type', 'image/png');
        res.write(buffer, 'binary');
        res.end(null, 'binary');
    }).catch(function (error) {
        console.log(error);
        res.status(500);
        res.send({
            error: error
        });
    });
};


module.exports = renderToRespone;
