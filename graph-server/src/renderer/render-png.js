/**
 * Chromium rendering implementation.
 */

const createPuppeteerPool = require('./puppeteer-pool');

// Set to determine the number of Chrome instances to maintain a pool of.
const POOL_SIZE = process.env.CHROME_POOL_SIZE || 2;

// Returns a generic-pool instance
const pool = createPuppeteerPool({
    min: 1,
    max: POOL_SIZE,

    // How long a resource can stay idle in pool before being removed
    idleTimeoutMillis: 60000,

    // Maximum number of times an individual resource can be reused before being
    // destroyed; set to 0 to disable
    maxUses: 50,

    // Function to validate an instance prior to use;
    // see https://github.com/coopernurse/node-pool#createpool
    validator: () => Promise.resolve(true),

    // Validate resource before borrowing; required for `maxUses and `validator`
    testOnBorrow: true,

    // For all opts, see opts at:
    // https://github.com/coopernurse/node-pool#createpool

    // Arguments to pass on to Puppeteer
    puppeteerArgs: {
        headless: true,
        executablePath: process.env.CHROME_BIN,
        args: [
            // Ignore CORS issues
            '--disable-web-security',
            '--no-sandbox'
        ]
    }
});

async function renderToPage(renderFunc) {
    // Grab a browser from the tool
    return await pool.use(async browser => {
        // Create a page to render to
        const page = await browser.newPage();
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        try {
            return await renderFunc(page);
        }
        finally {
            await page.close();
        }
    });
};

async function getPNG({pageContent, viewportSize, componentOptions}) {
    // Buffer to assign screenshot to
    let buffer;

    return await renderToPage(async function (page) {
        // Set the origin header for outgoing requests - this is to avoid waterservices
        // returning a 403 on a null origin.
        page.setExtraHTTPHeaders({
            origin: 'http://localhost:9000'
        });

        await page.setContent(pageContent);

        // Use an arbitrary width that will guarantee desktop-like rendering.
        page.setViewport(viewportSize);

        // Log browser console messages
        page.on('console', msg => console.log('[CONSOLE LOG]', msg.text()));

        const element = page.$('body');
        const text = await page.evaluate(element => element.textContent, element);

        // If the page should have a comparison series, wait for it. Otherwise,
        // wait for the current year series. Fall back to the no-data-message
        const chartSel = componentOptions.compare ? '#ts-compare-group' : '#ts-current-group';
        await page.waitForSelector(`${chartSel}, #no-data-message`);

        // Get a snapshot of either the graph or the no data message, if the
        // graph isn't visible
        let handle = await page.$('.graph-container');
        const isVisible = await handle.isIntersectingViewport();
        if (!isVisible) {
            handle = await page.$('#no-data-message');
        }

        // Generate screenshot
        return await handle.screenshot();
    });
};


module.exports = getPNG;
