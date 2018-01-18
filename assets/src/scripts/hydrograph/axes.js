const { axisBottom, axisLeft } = require('d3-axis');
const { format } = require('d3-format');
const { timeDay } = require('d3-time');
const { timeFormat } = require('d3-time-format');


/**
 * Create an x and y axis for hydrograph
 * @param  {D3 Scale} xScale    Scale object for the x-axis
 * @param  {D3 Scale} yScale    Scale object for the y-axis
 * @param  {Integer} yTickSize  Size of inner ticks for the y-axis
 * @return {Object}             {xAxis, yAxis}
 */
function createAxes(xScale, yScale, yTickSize) {
    // Create x-axis
    const xAxis = axisBottom()
        .scale(xScale)
        .ticks(timeDay)
        .tickFormat(timeFormat('%b %d, %Y'))
        .tickSizeOuter(0);

    // Create y-axis
    const tickCount = 5;
    const yDomain = yScale.domain();
    const tickSize = (yDomain[1] - yDomain[0]) / tickCount;
    const yAxis = axisLeft()
        .scale(yScale)
        .tickValues(Array(tickCount).fill(0).map((_, index) => {
            return yDomain[0] + index * tickSize;
        }))
        .tickFormat(format('.2f'))
        .tickSizeInner(yTickSize)
        .tickPadding(14)
        .tickSizeOuter(0);

    return {xAxis, yAxis};
}


/**
 * Adds the given axes to a node
 * @param  {Selected} options.plot    Node to append to
 * @param  {D3 Axis} options.xAxis    x-axis
 * @param  {D3 Axis} options.yAxis    y-axis
 * @param  {Object} options.xLoc      {x, y} location of x-axis
 * @param  {Object} options.yLoc      {x, y} location of y-axis
 * @param  {Object} options.yLabelLoc {x, y} location of y-axis label
 * @param  {String} options.yTitle    y-axis label
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


module.exports = {createAxes, appendAxes};
