const { axisBottom, axisLeft } = require('d3-axis');
const { timeFormat } = require('d3-time-format');
const { createSelector } = require('reselect');
const { DateTime } = require('luxon');

const { wrap } = require('../../utils');

const { getYTickDetails } = require('./domain');
const { layoutSelector } = require('./layout');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { yLabelSelector, tsTimeZoneSelector } = require('./timeSeries');

const { USWDS_LARGE_SCREEN } = require('../../config');
const { getCurrentDateRange, getCurrentParmCd } = require('../../selectors/timeSeriesSelector');
const { mediaQuery } = require('../../utils');


const FORMAT = {
    P7D: 'MMM dd',
    P30D: 'MMM dd',
    P1Y: 'MMM yyyy'
};

/**
 * Generate the values for ticks to place on a hydrograph.
 *
 * @param startDate - start datetime in the form of milliseconds since 1970-01-01 UTC
 * @param endDate - end datetime in the form of milliseconds since 1970-01-01 UTC
 * @param period - ISO duration for date range of the time series
 * @param ianaTimeZone - Internet Assigned Numbers Authority designation for a time zone
 * @returns {Array}
 */
export const generateDateTicks = function(startDate, endDate, period, ianaTimeZone) {
    const tzStartDate = DateTime.fromMillis(startDate, {zone: ianaTimeZone});
    let dates = [];
    let date;
    let timePeriod;
    let interval;
    switch (period) {
        case 'P7D':
            date = tzStartDate.startOf('day');
            timePeriod = 'days';
            interval = 1;
            break;
        case 'P30D':
            const startDateDay= tzStartDate.weekday;
            const weekStartDate = tzStartDate.minus({days: startDateDay});
            date = weekStartDate.startOf('day');
            timePeriod = 'weeks';
            interval = 1;
            break;
        case 'P1Y':
            date = tzStartDate.startOf('month');
            timePeriod = 'months';
            if (mediaQuery(USWDS_LARGE_SCREEN)) {
                interval = 1;
            } else {
                interval = 2;
            }
            break;
        default:
            date = tzStartDate.startOf('day');
            timePeriod = 'days';
            interval = 1;
    }
    while (date.valueOf() <= endDate) {
        date = date.plus({[timePeriod]: interval});
        if (startDate <= date.valueOf() && date.valueOf() <= endDate) {
            dates.push(date.valueOf());
        }
    }
    return dates;
};

/**
 * Create an x and y axis for hydrograph
 * @param  {Object} xScale      D3 Scale object for the x-axis
 * @param  {Object} yScale      D3 Scale object for the y-axis
 * @param  {Number} yTickSize   Size of inner ticks for the y-axis
 * @param {String} parmCd - parameter code of time series to be shown on the graph.
 * @param {String} period - ISO duration for date range of the time series
 * @param {String} ianaTimeZone - Internet Assigned Numbers Authority designation for a time zone
 * @return {Object}             {xAxis, yAxis} - D3 Axis
 */
export const createAxes = function({xScale, yScale}, yTickSize, parmCd, period, ianaTimeZone) {
    // Create x-axis
    const [startDate, endDate] = xScale.domain();
    const tickDates = generateDateTicks(startDate, endDate, period, ianaTimeZone);
    const xAxis = axisBottom()
        .scale(xScale)
        .tickValues(tickDates)
        .tickSizeOuter(0)
        .tickFormat(d => {
            return DateTime.fromMillis(d, {zone: ianaTimeZone}).toFormat(FORMAT[period]);
        });

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
    tsTimeZoneSelector,
    getCurrentParmCd,
    getCurrentDateRange,
    (xScale, yScale, layout, plotYLabel, ianaTimeZone, parmCd, currentDateRange) => {
        return {
            ...createAxes({xScale, yScale}, -layout.width + layout.margin.right, parmCd, currentDateRange, ianaTimeZone),
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
