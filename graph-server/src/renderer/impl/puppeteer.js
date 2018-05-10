/**
 * Chromium rendering implementation.
 */

const puppeteer = require('puppeteer');


// NOTE: We might want to maintain a pool of browser instances rather
// than just a single one. Alternately, we could maintain a process pool of
// node instances, and let the web server load balance between them.
// For now, just use a single Chromium instance.

async function getPNG(bundles, {pageContent, viewportSize, componentOptions}) {
    const browser = await puppeteer.launch({headless: true});

    // Initialize an empty page with the appropriate wdfn-component
    // TODO: Call the rendering function directly rather than rely on wdfn-component?
    // TODO: Update rendering code to render directly to an SVG?
    const page = await browser.newPage();
    await page.setContent(pageContent);

    // Use an arbitrary width that will guarantee desktop-like rendering.
    page.setViewport(viewportSize);

    // Set the origin header for outgoing requests - this is to avoid waterservices
    // returning a 403 on a null origin.
    page.setExtraHTTPHeaders({
        origin: 'http://wdfn-graph-server'
    });

    // Set the page content from the pre-built bundle.
    await Promise.all([
        page.addStyleTag({content: bundles.styles}),
        page.addScriptTag({content: bundles.script})
    ]);

    // If the page should have a comparison series, wait for it. Otherwise,
    // wait for the current year series.
    const waitFor = componentOptions.compare ? '.ts-compare' : '.ts-current';
    await page.waitForSelector(waitFor);

    const graphHandle = await page.$('.graph-container');
    const buffer = await graphHandle.screenshot();

    await page.close();
    await browser.close();

    return buffer;
};


module.exports = getPNG;
