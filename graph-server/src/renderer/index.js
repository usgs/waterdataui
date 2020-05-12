const axios = require('axios');

const renderPNG = require('./render-png');

const SERVICE_ROOT = process.env.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';
const PAST_SERVICE_ROOT = process.env.PAST_SERVICE_ROOT || 'https://nwis.waterservices.usgs.gov/nwis';
const STATIC_ROOT = process.env.STATIC_ROOT || 'https://waterdata.usgs.gov/nwisweb/wsgi/static';
const OGC_SITE_ENDPOINT = process.env.OGC_SITE_ENDPOINT || 'https://labs.waterdata.usgs.gov/api/observations/collections/monitoring-locations/items/';


const renderToResponse = function (res,
                                   {
                                       siteID,
                                       parameterCode,
                                       compare,
                                       period,
                                       startDT,
                                       endDT,
                                       timeSeriesId,
                                       showMLName,
                                       width
                                   }) {
    console.log(`Using static root ${STATIC_ROOT}`);
    console.log(`Retrieving site id with ${OGC_SITE_ENDPOINT}USGS-${siteID}?f=json`);
    axios.get(`${OGC_SITE_ENDPOINT}USGS-${siteID}?f=json`)
        .then((resp) => {
            const componentOptions = {
                siteno: siteID,
                latitude: resp.data.geometry.coordinates[1],
                longitude: resp.data.geometry.coordinates[0],
                parameterCode: parameterCode,
                compare: compare,
                period: period,
                startDT: startDT,
                endDT: endDT,
                timeSeriesId: timeSeriesId,
                cursorOffset: false,
                showOnlyGraph: true,
                showMLName: showMLName
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
                    <body id="monitoring-location-page-container">
                        <div class="wdfn-component" data-component="hydrograph" data-options='${JSON.stringify(componentOptions)}'>
                            <div class="graph-container"></div>
                        </div>
                    </body>
                </html>`,
                viewportSize: {
                    width: width,
                    height: width
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
        })
        .catch((error) => {
            console.log(`Failed to fetch site metadata: ${error}`);
        });
};


module.exports = renderToResponse;
