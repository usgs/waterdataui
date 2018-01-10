const { axisBottom, axisLeft } = require('d3-axis');
const { format } = require('d3-format');
const { timeDay } = require('d3-time');
const { timeFormat } = require('d3-time-format');


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
        .tickFormat(format('d'))
        .tickSizeInner(yTickSize)
        .tickPadding(12)
        .tickSizeOuter(0);

    return {xAxis, yAxis};
}


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
