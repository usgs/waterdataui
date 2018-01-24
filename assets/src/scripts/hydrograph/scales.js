const { extent } = require('d3-array');
const { scaleLinear, scaleTime } = require('d3-scale');


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
    //const yExtent = extent(data, d => d.value);
    const yExtent = [10, 30];
    console.log(yExtent);
    // Add 20% of the y range as padding on both sides of the extent.
    let yPadding = 0.2 * (yExtent[1] - yExtent[0]);
    yExtent[0] -= yPadding;
    yExtent[1] += yPadding;

    // xScale is oriented on the left
    const xScale = scaleTime()
        .range([0, xSize])
        .domain(xExtent);

    // yScale is oriented on the bottom
    const yScale = scaleLinear()
        .range([ySize, 0])
        .domain(yExtent);

    return {xScale, yScale};
}


module.exports = {createScales};
