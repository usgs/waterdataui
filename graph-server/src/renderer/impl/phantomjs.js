/**
 * This is a work-in-progress attempt at a PhantomJS renderer.
 * It serves mostly as a tool for helping the core rendering entrypoint support
 * multiple rendering implementations.
 */

const phantom = require('phantom');


async function getSvg(bundles, {pageContent, viewportSize, pageURL}) {
    const instance = await phantom.create();
    const page = await instance.createPage();
    await page.property('viewportSize', viewportSize);

    await page.evaluate(function (script) {
        // Insert script tag
        const scriptTag = document.createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.innerHTML = script;
        document.getElementsByTagName('body')[0].appendChild(scriptTag);
    }, bundles.script);

    const status = await page.setContent(pageContent, pageURL);

    // Hack - wait for rendering to complete
    setTimeout(function() {}, 3000);

    const content = await page.property('content');

    await instance.exit();

    return content
};


module.exports = getSvg;
