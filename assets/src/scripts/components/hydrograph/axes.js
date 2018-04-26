const { axisBottom, axisLeft } = require('d3-axis');
const { timeDay } = require('d3-time');
const { timeFormat } = require('d3-time-format');
const { createSelector } = require('reselect');

const { wrap } = require('../../utils');

const { getYTickDetails } = require('./domain');
const { layoutSelector } = require('./layout');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { currentVariableSelector, yLabelSelector } = require('./timeseries');

/**
 * Create an x and y axis for hydrograph
 * @param  {Object} xScale      D3 Scale object for the x-axis
 * @param  {Object} yScale      D3 Scale object for the y-axis
 * @param  {Number} yTickSize   Size of inner ticks for the y-axis
 * @param {String} parmCd - parameter code of timeseries to be shown on the graph.
 * @return {Object}             {xAxis, yAxis} - D3 Axis
 */
export const createAxes = function({xScale, yScale}, yTickSize, parmCd) {
    const formatter = function(d) {
        let formatter = null;
        if(d.getHours() === 12) {
            formatter = timeFormat('%b %d');
            return formatter(d);
        } else {
            return null;
        }
    };

    // Create x-axis
    const xAxis = axisBottom()
        .scale(xScale)
        .ticks(timeDay)
        .tickFormat('')
        .tickSizeOuter(0);

    // Create a second x-axis to hold date/time labels
    const xAxisWithDateTimeLabels = axisBottom()
        .scale(xScale)
        .ticks(timeDay.hour12)
        .tickPadding(5)
        .tickSize(0)
        .tickFormat(formatter);
    // Create y-axis
    const tickDetails = getYTickDetails(yScale.domain(), parmCd);
    const yAxis = axisLeft()
        .scale(yScale)
        .tickValues(tickDetails.tickValues)
        .tickFormat(tickDetails.tickFormat)
        .tickSizeInner(yTickSize)
        .tickPadding(3)
        .tickSizeOuter(0);

     return {xAxis, xAxisWithDateTimeLabels, yAxis};
};


/**
 * Returns data necessary to render the graph axes.
 * @return {Object}
 */
export const axesSelector = createSelector(
    xScaleSelector('current'),
    yScaleSelector,
    layoutSelector,
    yLabelSelector,
    currentVariableSelector,
    (xScale, yScale, layout, plotYLabel, currentVariable) => {
        const parmCd = currentVariable ? currentVariable.variableCode.value : null;
        return {
            ...createAxes({xScale, yScale}, -layout.width + layout.margin.right, parmCd),
            layout: layout,
            yTitle: plotYLabel
        };
    }
);


/**
 * Add x and y axes to the given svg node.
 */
//export const appendAxes = function(elem, {xAxis, yAxis, layout, yTitle}) { // original line
export const appendAxes = function(elem, {xAxis, xAxisWithDateTimeLabels, yAxis, layout, yTitle}) { // revamped line
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
    elem.selectAll('.x-axis, .x-axis-date-time-label, .y-axis').remove();

    // Add x-axis
    elem.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${xLoc.x}, ${xLoc.y})`)
        .call(xAxis);

    // Add the second x-axis -- the one with the centered date/time labels
    elem.append('g')
        .attr('class', 'x-axis-date-time-label')
        .attr('transform', `translate(${xLoc.x}, ${xLoc.y})`)
        .call(xAxisWithDateTimeLabels);

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
};