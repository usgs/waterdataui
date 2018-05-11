const BUNDLES = require('../assets');


const getPNGImpl = {
    puppeteer: require('./impl/puppeteer'),
    phantomjs: require('./impl/phantomjs')
};
const DEFAULT_IMPLEMENTATION = 'puppeteer';


const SERVICE_ROOT = process.env.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';
const PAST_SERVICE_ROOT = process.env.PAST_SERVICE_ROOT || 'https://nwis.waterservices.usgs.gov/nwis';
const STATIC_ROOT = process.env.STATIC_ROOT || 'https://waterdata.usgs.gov/nwisweb/wsgi/static';


const renderToRespone = function (res, {siteID, parameterCode, compare, renderer}) {
    const getPNG = getPNGImpl[renderer] || getPNGImpl[DEFAULT_IMPLEMENTATION];
    const componentOptions = {
        siteno: siteID,
        parameter: parameterCode,
        compare: compare,
        cursorOffset: false,
        interactive: false
    };
    getPNG(BUNDLES, {
        pageURL: 'http://wdfn-graph-server',
        pageContent: `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <script type="text/javascript">
                        var CONFIG = {
                            SERVICE_ROOT: '${SERVICE_ROOT}',
                            PAST_SERVICE_ROOT: '${PAST_SERVICE_ROOT}',
                            STATIC_URL: '${STATIC_ROOT}'
                        };
                    </script>
                </head>
                <body>
                    <div class="wdfn-component" data-component="hydrograph" data-options='${JSON.stringify(componentOptions)}'>
                        <div class="graph-container"></div>
                    </div>
                    <script>
                </body>
            </html>`,
        viewportSize: {
            width: 1200,
            height: 1200
        },
        componentOptions
    })
    .then((buffer) => {
        res.setHeader('Content-Type', 'image/png');
        res.write(buffer, 'binary');
        res.end(null, 'binary');
    })
    .catch(error => {
        console.log(error);
        res.status(500);
        res.send(error);
    });
};


module.exports = renderToRespone;
