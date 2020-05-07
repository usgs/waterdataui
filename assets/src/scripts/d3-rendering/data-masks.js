/*
 * Render pattern definitions that can be used when rendering masked time series data
 * @param {D3 defs elem} defsElem
 * @param {String} maskId - used to identify the mask element and should be unique within the application.
 * @param {Array of Object} patterns - where each object has the following properties
 *      @prop {String} patternId - Should identify the pattern and should be unique within the application
 *      @prop {String} patternTransform
 */
export const renderMaskDefs = function(defsElem, maskId, patterns) {
    defsElem.append('mask')
        .attr('id', maskId)
        .attr('maskUnits', 'userSpaceOnUse')
        .append('rect')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#0000ff');
    patterns.forEach((pattern) => {
        defsElem.append('pattern')
            .attr('id', pattern.patternId)
            .attr('width', '8')
            .attr('height', '8')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('patternTransform', pattern.patternTransform)
            .append('rect')
                .attr('width', '4')
                .attr('height', '8')
                .attr('mask', `url(#${maskId})`);
    });
};