const puppeteer = require('puppeteer');


// NOTE: We might want to maintain a pool of browser instances rather
// than just a single one. Alternately, we could maintain a process pool of
// node instances, and let the web server load balance between them.
// For now, just use a single Chromium instance.

async function getSvg(bundles, options) {
    const browser = await puppeteer.launch({headless: false});

    // Initialize an empty page with the appropriate wdfn-component
    // TODO: Update rendering code to render directly to an SVG?
    const page = await browser.newPage();
    await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <script type="text/javascript">
                    var CONFIG = {
                        SERVICE_ROOT: '${options.serviceRoot}',
                        PAST_SERVICE_ROOT: '${options.pastServiceRoot}'
                    };
                </script>
            </head>
            <body>
                <div class="wdfn-component" data-component="hydrograph" data-siteno="${options.siteID}" data-parameter="${options.parameterCode}">
                    <div class="graph-container"></div>
                </div>
            </body>
        </html>`
    );

    // Use an arbitrary width that will guarantee desktop-like rendering.
    page.setViewport({
        width: 1200,
        height: 1200
    });

    // Set the origin header for outgoing requests - this is to avoid waterservices
    // returning a 403 on a null origin.
    page.setExtraHTTPHeaders({
        origin: 'http://wdfn-graph-server'
    });

    // Set the page content from the pre-built bundle.
    await Promise.all([
        page.addScriptTag({content: bundles.script}),
        page.addStyleTag({content: bundles.styles})
    ]);

    // Wait until we have a line drawn
    // FIXME: line-segment isn't getting created
    //await page.waitForSelector('.line-segment');
    await page.waitForSelector('svg');

    // Get the SVG string
    const svgHandle = await page.$('.hydrograph-container svg');
    const svgStr = await page.evaluate((svg) => {
        return svg.outerHTML;
    }, svgHandle);

    await page.close();
    await browser.close();

    return svgStr;
};


module.exports = { getSvg };
