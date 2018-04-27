const { axisBottom, axisLeft } = require('d3-axis');
const { timeDay, timeWeek, timeMonth } = require('d3-time');
const { timeFormat } = require('d3-time-format');
const { createSelector } = require('reselect');

const { wrap } = require('../../utils');

const { getYTickDetails } = require('./domain');
const { layoutSelector } = require('./layout');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { yLabelSelector } = require('./timeSeries');

const { getCurrentDateRange, getCurrentParmCd } = require('../../selectors/timeSeriesSelector');

const dateFormatter = timeFormat('%b %d');

const INTERVAL = {
    P7D: timeDay,
    P30D: timeWeek,
    P1Y: timeMonth
};

const FORMAT = {
    P7D: dateFormatter,
    P30D: dateFormatter,
    P1Y: timeFormat('%b %Y')
};


/**
 * Create an x and y axis for hydrograph
 * @param  {Object} xScale      D3 Scale object for the x-axis
 * @param  {Object} yScale      D3 Scale object for the y-axis
 * @param  {Number} yTickSize   Size of inner ticks for the y-axis
 * @param {String} parmCd - parameter code of timeseries to be shown on the graph.
 * * @param {String} period - ISO duration for date range of the timeseries
 * @return {Object}             {xAxis, yAxis} - D3 Axis
 */
export const createAxes = function({xScale, yScale}, yTickSize, parmCd, period) {
    const formatter = function(d) {
        if(d.getHours() === 12) {
            return dateFormatter(d);
        } else {
            return null;
        }
    };
    // Create x-axis
    const xAxis = axisBottom()
        .scale(xScale)
        .ticks(INTERVAL[period] ? INTERVAL[period] : timeDay)
        .tickSizeOuter(0);
    let xAxisWithDateTimeLabels;
    if (period === 'P7D') {
        // Only show tick marks on xAxis
        // Create a second x-axis. This x-axis will overlay the first x-axis and have labels every 12 hours but no ticks.
        // Labels not on the 12 hour points are removed with formatting.
        xAxis.tickFormat('');
        xAxisWithDateTimeLabels = axisBottom()
            .scale(xScale)
            .ticks(timeDay.hour)
            .tickPadding(5)
            .tickSize(0)
            .tickFormat(formatter);
    } else {
        xAxis.tickFormat(FORMAT[period]);
    }
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
    getCurrentParmCd,
    getCurrentDateRange,
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
export const appendAxes = function(elem, {xAxis, xAxisWithDateTimeLabels, yAxis, layout, yTitle}) {
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

    if (xAxisWithDateTimeLabels) {
        // Add the second x-axis, the one with the centered date/time labels, on top of the first x-axis
        elem.append('g')
            .attr('class', 'x-axis-date-time-label')
            .attr('transform', `translate(${xLoc.x}, ${xLoc.y})`)
            .call(xAxisWithDateTimeLabels);
    }

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