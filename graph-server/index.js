const http = require('http');
const logger = require('console');
const puppeteer = require('puppeteer');


// NOTE: We might want to maintain a pool of browser instances rather
// than just a single one. Alternately, we could maintain a process pool of
// node instances, and let the web server load balance between them.
// For now, just use a single Chromium instance.
puppeteer.launch().then((browser) => {
    var server = http.createServer((req, res) => {
        (async () => {
            // Load a graph
            const page = await browser.newPage();
            await page.goto('http://localhost:5050/monitoring-location/07048495/');

            // Wait until we have a line drawn
            await page.waitForSelector('.line-segment');

            // Get the SVG string
            const svgHandle = await page.$('.hydrograph-container svg');
            const svgStr = await page.evaluate((svg) => {
                return svg.outerHTML;
            }, svgHandle);

            /* to write a screenshot:
            const buffer = await page.screenshot();
            res.setHeader('Content-Type', 'image/png');
            res.write(buffer, 'binary');
            res.end(null, 'binary');
            */

            await page.close();

            res.setHeader('Content-Type', 'image/svg+xml');
            res.write(svgStr);
            res.end();
        })();
    });
    server.listen(2929);
    logger.log('listening on port 2929');
});
