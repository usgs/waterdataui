const { extent } = require('d3-array');
const { scaleLinear, scaleTime } = require('d3-scale');

function extendDomain(extent) {
    const padding = 0.2 * (extent[1] - extent[0]);
    return [extent[0] - padding, extent[1] + padding];
}

/**
 * Create scales for hydrograph charts. X is linear to time and Y is logarithmic.
 * @param  {Array} data    Array containing {time, value} items
 * @param  {Number} xSize X range of scale
 * @param  {Number} ySize Y range of scale
 * @return {Object}        {xScale, yScale}
 */
function createScales(data, xSize, ySize) {
    // Calculate max and min for data
    const xExtent = extent(data, d => d.time);
    const yExtent = extent(data, d => d.value);

    // xScale is oriented on the left
    const xScale = scaleTime()
        .range([0, xSize])
        .domain(xExtent);

    // yScale is oriented on the bottom
    const yScale = scaleLinear()
        .range([ySize, 0])
        .domain(extendDomain(yExtent));

    return {xScale, yScale};
}

function updateYScale(yScale, newYDataExtent) {
    let yPadding = 0.2 * (newYDataExtent[1] - newYDataExtent[0]);
    yScale.domain([newYDataExtent[0] - yPadding, newYDataExtent[1] + yPadding]);

}


module.exports = {createScales, updateYScale};
