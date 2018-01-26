const { extent } = require('d3-array');
const { scaleLinear, scaleTime } = require('d3-scale');

const paddingRatio = 0.2;

/**
 *  Return domainExtent padded on both ends by paddingRatio
 *  @param {Array} domainExtent - array of two numbers
 *  @return {Array} - array of two numbers
 */
function extendDomain(domainExtent) {
    const padding = paddingRatio * (domainExtent[1] - domainExtent[0]);
    return [domainExtent[0] - padding, domainExtent[1] + padding];
}

/**
 * Create an xcale oriented on the left
 * @param {Array} data - Array contains {time, ...}
 * @param {Number} xSize - range of scale
 * @eturn {Object} d3 scale for time.
 */
function createXScale(data, xSize) {
    // Calculate max and min for data
    const xExtent = extent(data, d => d.time);

    // xScale is oriented on the left
    return scaleTime()
        .range([0, xSize])
        .domain(xExtent);
}

/**
 * Create an ycale oriented on the bottom
 * @param {Array} data - Array contains {value, ...}
 * @param {Number} xSize - range of scale
 * @eturn {Object} d3 scale for value.
 */
function createYScale(data, ySize) {
    // Calculate max and min for data
    const yExtent = extent(data, d => d.value);

    // yScale is oriented on the bottom
    return scaleLinear()
        .range([ySize, 0])
        .domain(extendDomain(yExtent));
}

/**
 * Create scales for hydrograph charts. X is linear to time and Y is logarithmic.
 * @param  {Array} data    Array containing {time, value} items
 * @param  {Number} xSize X range of scale
 * @param  {Number} ySize Y range of scale
 * @return {Object}        {xScale, yScale}
 */
function createScales(data, xSize, ySize) {
    const xScale = createXScale(data, xSize);
    const yScale = createYScale(data, ySize);

    return {xScale, yScale};
}

/**
 * Updates the domain of yScale with the new extent including the paddingRatio
 * @param yScale
 * @param newYDataExtent
 */
function updateYScale(yScale, newYDataExtent) {
    yScale.domain(extendDomain(newYDataExtent));

}


module.exports = {createScales, createXScale, createYScale, updateYScale};
