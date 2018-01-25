const { extent } = require('d3-array');
const { scaleLinear, scaleTime } = require('d3-scale');

function extendDomain(extent) {
    const padding = 0.2 * (extent[1] - extent[0]);
    return [extent[0] - padding, extent[1] + padding];
}

function createXScale(data, xSize) {
    // Calculate max and min for data
    const xExtent = extent(data, d => d.time);

    // xScale is oriented on the left
    return scaleTime()
        .range([0, xSize])
        .domain(xExtent);
}

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

function updateYScale(yScale, newYDataExtent) {
    let yPadding = 0.2 * (newYDataExtent[1] - newYDataExtent[0]);
    yScale.domain([newYDataExtent[0] - yPadding, newYDataExtent[1] + yPadding]);

}


module.exports = {createScales, createXScale, createYScale, updateYScale};
