const { axisBottom, axisLeft } = require('d3-axis');
const { timeDay } = require('d3-time');
const { timeFormat } = require('d3-time-format');
const { createSelector } = require('reselect');

const { wrap } = require('../../utils');

const { getYTickDetails } = require('./domain');
const { layoutSelector } = require('./layout');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { yLabelSelector } = require('./timeseries');


/**
 * Create an x and y axis for hydrograph
 * @param  {Object} xScale      D3 Scale object for the x-axis
 * @param  {Object} yScale      D3 Scale object for the y-axis
 * @param  {Number} yTickSize   Size of inner ticks for the y-axis
 * @return {Object}             {xAxis, yAxis} - D3 Axis
 */
function createAxes({xScale, yScale}, yTickSize) {
    // Create x-axis
    const xAxis = axisBottom()
        .scale(xScale)
        .ticks(timeDay)
        .tickFormat(timeFormat('%b %d'))
        .tickSizeOuter(0);

    // Create y-axis
    const tickDetails = getYTickDetails(yScale.domain());
    const yAxis = axisLeft()
        .scale(yScale)
        .tickValues(tickDetails.tickValues)
        .tickFormat(tickDetails.tickFormat)
        .tickSizeInner(yTickSize)
        .tickPadding(3)
        .tickSizeOuter(0);

    return {xAxis, yAxis};
}


/**
 * Returns data necessary to render the graph axes.
 * @return {Object}
 */
const axesSelector = createSelector(
    xScaleSelector('current'),
    yScaleSelector,
    layoutSelector,
    yLabelSelector,
    (xScale, yScale, layout, plotYLabel) => {
        return {
            ...createAxes({xScale, yScale}, -layout.width + layout.margin.right),
            layout: layout,
            yTitle: plotYLabel
        };
    }
);


/**
 * Add x and y axes to the given svg node.
 */
function appendAxes(elem, {xAxis, yAxis, layout, yTitle}) {
    const xLoc = {
        x: 0,
        y: layout.height - (layout.margin.top + layout.margin.bottom)
    };
    const yLoc = {x: 0, y: 0};
    const yLabelLoc = {
        x: layout.height / -2 + layout.margin.top,
        y: -1 * layout.margin.left + 12
    };

    // Remove existing axes before adding the new ones.
    elem.selectAll('.x-axis, .y-axis').remove();

    // Add x-axis
    elem.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${xLoc.x}, ${xLoc.y})`)
        .call(xAxis);

    // Add y-axis and a text label
    elem.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${yLoc.x}, ${yLoc.y})`)
        .call(yAxis)
        .append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', yLabelLoc.x)
            .attr('y', yLabelLoc.y)
            .text(yTitle)
                .call(wrap, layout.height - (layout.margin.top + layout.margin.bottom));
}


module.exports = {createAxes, appendAxes, axesSelector};
