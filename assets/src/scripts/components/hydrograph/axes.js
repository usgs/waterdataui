const { axisBottom, axisLeft } = require('d3-axis');
const { timeDay, timeWeek, timeMonth } = require('d3-time');
const { timeFormat } = require('d3-time-format');
const { createSelector } = require('reselect');

const { wrap } = require('../../utils');

const { getYTickDetails } = require('./domain');
const { layoutSelector } = require('./layout');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { yLabelSelector } = require('./timeseries');

const { currentDateRangeSelector, currentParmCdSelector } = require('../../selectors/timeseriesSelector');

const INTERVAL = {
    P7D: timeDay,
    P30D: timeWeek,
    P1Y: timeMonth
};
/**
 * Create an x and y axis for hydrograph
 * @param  {Object} xScale      D3 Scale object for the x-axis
 * @param  {Object} yScale      D3 Scale object for the y-axis
 * @param  {Number} yTickSize   Size of inner ticks for the y-axis
 * @param {String} parmCd - parameter code of timeseries to be shown on the graph.
 * @param {String} period - ISO duration for date range of the timeseries
 * @return {Object}             {xAxis, yAxis} - D3 Axis
 */
export const createAxes = function({xScale, yScale}, yTickSize, parmCd, period) {
    // Create x-axis
    const xAxis = axisBottom()
        .scale(xScale)
        .ticks(INTERVAL[period] ? INTERVAL[period] : timeDay)
        .tickFormat(timeFormat('%b %d'))
        .tickSizeOuter(0);

    // Create y-axis
    const tickDetails = getYTickDetails(yScale.domain(), parmCd);
    const yAxis = axisLeft()
        .scale(yScale)
        .tickValues(tickDetails.tickValues)
        .tickFormat(tickDetails.tickFormat)
        .tickSizeInner(yTickSize)
        .tickPadding(3)
        .tickSizeOuter(0);

    return {xAxis, yAxis};
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
    currentParmCdSelector,
    currentDateRangeSelector,
    (xScale, yScale, layout, plotYLabel, parmCd, currentDateRange) => {
        return {
            ...createAxes({xScale, yScale}, -layout.width + layout.margin.right, parmCd, currentDateRange),
            layout: layout,
            yTitle: plotYLabel
        };
    }
);


/**
 * Add x and y axes to the given svg node.
 */
export const appendAxes = function(elem, {xAxis, yAxis, layout, yTitle}) {
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
};