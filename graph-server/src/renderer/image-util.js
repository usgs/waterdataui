const SVGO = require('svgo');

// Create an SVGO config
// SVGO loads most of these plugins by default, but we duplicate all of them here
// for reference purposes.
// Comments above the plugins note application-specific things.
// Comments to the right of the line are from the SVGO documentation.
// These plugins are up-to-date as of SVGO 1.0.5
const svgo = new SVGO({
    plugins: [
        {cleanupAttrs: true},  // cleanup attributes from newlines, trailing, and repeating spaces
        {removeDoctype: true},  // remove doctype declaration
        {removeXMLProcInst: true},  // remove XML processing instructions
        {removeComments: true},  // remove comments
        {removeMetadata: true},  // remove <metadata>
        {removeTitle: true},  // remove <title>
        {removeDesc: true},  // remove <desc>
        {removeUselessDefs: true},  // remove elements of <defs> without id
        {removeXMLNS: false},  // removes xmlns attribute (for inline svg, disabled by default)
        {removeEditorsNSData: true},  // remove editors namespaces, elements, and attributes
        {removeEmptyAttrs: true},  // remove empty attributes
        {removeHiddenElems: true},  // remove hidden elements
        {removeEmptyText: true},  // remove empty Text elements
        {removeEmptyContainers: true},  // remove empty Container elements
        {removeViewBox: true},  // remove viewBox attribute when possible
        {cleanupEnableBackground: true},  // remove or cleanup enable-background attribute when possible
        {minifyStyles: true},  // minify <style> elements content with CSSO
        {convertStyleToAttrs: true},  // convert styles into attributes
        // This causes the y-axis label to be removed:
        {inlineStyles: false},  // Moves + merges styles from style elements to element styles
        {convertColors: true},  // convert colors (from rgb() to #rrggbb, from #rrggbb to #rgb)
        {convertPathData: true},  // convert Path data to relative or absolute (whichever is shorter), convert one segment to another, trim useless delimiters, smart rounding, and much more
        {convertTransform: true},  // collapse multiple transforms into one, convert matrices to the short aliases, and much more
        {removeUnknownsAndDefaults: true},  // remove unknown elements content and attributes, remove attrs with default values
        {removeNonInheritableGroupAttrs: true},  // remove non-inheritable group's "presentation" attributes
        {removeUselessStrokeAndFill: true},  // remove useless stroke and fill attrs
        {removeUnusedNS: true},  // remove unused namespaces declaration
        {cleanupIDs: true},  // remove unused and minify used IDs
        {cleanupNumericValues: true},  // round numeric values to the fixed precision, remove default px units
        {cleanupListOfValues: true},  // round numeric values in attributes that take a list of numbers (like viewBox or enable-background)
        {moveElemsAttrsToGroup: true},  // move elements' attributes to their enclosing group
        {moveGroupAttrsToElems: true},  // move some group attributes to the contained elements
        {collapseGroups: true},  // collapse useless groups
        {removeRasterImages: false},  // remove raster images (disabled by default)
        {mergePaths: true},  // merge multiple Paths into one
        // This causes axis lines to not be styled properly:
        {convertShapeToPath: false},  // convert some basic shapes to <path>
        {sortAttrs: true},  // sort element attributes for epic readability (disabled by default)
        {removeDimensions: true},  // remove width/height attributes if viewBox is present (opposite to removeViewBox, disable it first) (disabled by default)
        {removeAttrs: false},  // remove attributes by pattern (disabled by default)
        {removeElementsByAttr: false},  // remove arbitrary elements by ID or className (disabled by default)
        {addClassesToSVGElement: false},  // add classnames to an outer <svg> element (disabled by default)
        {addAttributesToSVGElement: false},  // adds attributes to an outer <svg> element (disabled by default)
        {removeStyleElement: false},  // remove <style> elements (disabled by default)
        {removeScriptElement: false},  // remove <script> elements (disabled by default)
    ]
});


/**
 * Processes a given SVG into a format suitable for returning to the end-user.
 * This function:
 *     - Inlines CSS, if provided
 *     - Minifies with SVGO
 * @return {[type]} [description]
 */
const processSvg = async function (cssStr, svgString) {
    const index = svgString.indexOf('</svg>');
    const svgWithCSS = `${svgString.substr(0, index)}<style>${cssStr}</style>${svgString.substr(index)}`;

    // skip svgo for now, because it's removing the y-axis label
    return svgo.optimize(svgWithCSS).then(result => {
        return result.data;
    });
};


module.exports = { processSvg };
