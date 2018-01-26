const { axisBottom, axisTop, axisLeft } = require('d3-axis');
const { format } = require('d3-format');
const { timeDay } = require('d3-time');
const { timeFormat } = require('d3-time-format');

const yTickCount = 5;

/**
 * Helper function which generates y tick values for a scale
 * @param {Object} yScale - d3 scale
 * @returns {Array} of tick values
 */
function yTickValues(yScale) {
    const yDomain = yScale.domain();
    const tickSize = (yDomain[1] - yDomain[0]) / yTickCount;
    return Array(yTickCount).fill(0).map((_, index) => {
        return yDomain[0] + index * tickSize;
    });
}


/**
 * Create an x and y axis for hydrograph
 * @param  {Object} xScale      D3 Scale object for the x-axis
 * @param  {Object} yScale      D3 Scale object for the y-axis
 * @param  {Number} yTickSize   Size of inner ticks for the y-axis
 * @return {Object}             {xAxis, yAxis} - D3 Axis
 */
function createAxes(xScale, yScale, yTickSize) {
    // Create x-axis
    const xAxis = axisBottom()
        .scale(xScale)
        .ticks(timeDay)
        .tickFormat(timeFormat('%b %d'))
        .tickSizeOuter(0);

    // Create y-axis
    const yAxis = axisLeft()
        .scale(yScale)
        .tickValues(yTickValues(yScale))
        .tickFormat(format('.2f'))
        .tickSizeInner(yTickSize)
        .tickPadding(14)
        .tickSizeOuter(0);

    return {xAxis, yAxis};
}

/**
 * Updates/Sets the yAxis.tickValues
 * @param {Object} yAxis - d3 axis
 * @param {Object} yScale - d3 scale
 */
function updateYAxis(yAxis, yScale) {
    yAxis.tickValues(yTickValues(yScale));
}

/**
 * Adds the given axes to a node
 * @param  {Object} plot      Node to append to
 * @param  {Object} xAxis     D3 Axis x-axis
 * @param  {Object} yAxis     D3 Axis y-axis
 * @param  {Object} xLoc      {x, y} location of x-axis
 * @param  {Object} yLoc      {x, y} location of y-axis
 * @param  {Object} yLabelLoc {x, y} location of y-axis label
 * @param  {String} yTitle    y-axis label
 */
function appendAxes({plot, xAxis, yAxis, xLoc, yLoc, yLabelLoc, yTitle}) {
    plot.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${xLoc.x}, ${xLoc.y})`)
        .call(xAxis);

    // Add y-axis and a text label
    plot.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${yLoc.x}, ${yLoc.y})`)
        .call(yAxis)
        .append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', yLabelLoc.x)
            .attr('y', yLabelLoc.y)
            .attr('dy', '0.71em')
            .text(yTitle);
}


module.exports = {createAxes, updateYAxis, appendAxes};
