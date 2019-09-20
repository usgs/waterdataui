import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { createSelector } from 'reselect';
import { DateTime } from 'luxon';
import { wrap, deltaDays } from '../../utils';
import { getYTickDetails } from './domain';
import { layoutSelector } from './layout';
import { xScaleSelector, yScaleSelector, secondaryYScaleSelector } from './scales';
import { yLabelSelector, secondaryYLabelSelector, tsTimeZoneSelector, TEMPERATURE_PARAMETERS } from './time-series';
import config from '../../config';
import { getCurrentDateRange, getCurrentParmCd } from '../../selectors/time-series-selector';
import { convertCelsiusToFahrenheit, convertFahrenheitToCelsius, mediaQuery } from '../../utils';


const FORMAT = {
    P7D: 'MMM dd',
    P30D: 'MMM dd',
    P1Y: 'MMM yyyy',
    custom: null
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
    let dateDiff;

    const setP7D = () => {
        date = tzStartDate.startOf('day');
        timePeriod = 'days';
        interval = 1;
    };
    const setP30D = () => {
        date = tzStartDate.minus({days: tzStartDate.weekday}).startOf('day');
        timePeriod = 'weeks';
        interval = 1;
    };
    const setP1Y = () => {
        date = tzStartDate.startOf('month');
        timePeriod = 'months';
        if (mediaQuery(config.USWDS_LARGE_SCREEN)) {
            interval = 1;
        } else {
            interval = 2;
        }
    };
    switch (period) {
        case 'P7D':
            setP7D();
            break;
        case 'P30D':
            setP30D();
            break;
        case 'P1Y':
            setP1Y();
            break;
        case 'custom':
            dateDiff = deltaDays(new Date(startDate), new Date(endDate));
            if (dateDiff <= 7) {
                setP7D();
                FORMAT.custom = 'MMM dd';
            } else if (7 < dateDiff && dateDiff <= 30) {
                setP30D();
                FORMAT.custom = 'MMM dd';
            } else if (30 < dateDiff && dateDiff <= 365) {
                setP1Y();
                FORMAT.custom = 'MMM yyyy';
            } else {
                date = tzStartDate.startOf('month');
                timePeriod = 'months';
                interval = Math.ceil(dateDiff/365.25);
                FORMAT.custom = 'MMM yyyy';
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
export const createAxes = function({xScale, yScale, secondaryYScale}, yTickSize, parmCd, period, ianaTimeZone) {
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

    let secondaryYAxis = null;

    const createSecondaryYAxis = function(tickValues, scale) {
        return axisRight()
            .scale(scale)
            .tickValues(tickValues)
            .tickFormat(t => t.toFixed(1))
            .tickSizeInner(yTickSize)
            .tickPadding(3)
            .tickSizeOuter(0);
    };

    if (secondaryYScale !== null) {
        let secondaryAxisTicks;
        const primaryAxisTicks = tickDetails.tickValues;
        if (TEMPERATURE_PARAMETERS.celsius.includes(parmCd)) {
            secondaryAxisTicks = primaryAxisTicks.map(celsius => convertCelsiusToFahrenheit(celsius));
        } else if (TEMPERATURE_PARAMETERS.fahrenheit.includes(parmCd)) {
            secondaryAxisTicks = primaryAxisTicks.map(fahrenheit => convertFahrenheitToCelsius(fahrenheit));
        }
        secondaryYAxis = createSecondaryYAxis(secondaryAxisTicks, secondaryYScale);
    }
    return {xAxis, yAxis, secondaryYAxis};
};


/**
 * Returns data necessary to render the graph axes.
 * @return {Object}
 */
export const axesSelector = createSelector(
    xScaleSelector('current'),
    yScaleSelector,
    secondaryYScaleSelector,
    layoutSelector,
    yLabelSelector,
    tsTimeZoneSelector,
    getCurrentParmCd,
    getCurrentDateRange,
    secondaryYLabelSelector,
    (xScale, yScale, secondaryYScale, layout, plotYLabel, ianaTimeZone, parmCd, currentDateRange, plotSecondayYLabel) => {
        return {
            ...createAxes(
                {xScale, yScale, secondaryYScale},
                -layout.width + layout.margin.right,
                parmCd,
                currentDateRange,
                ianaTimeZone
            ),
            layout: layout,
            yTitle: plotYLabel,
            secondaryYTitle: plotSecondayYLabel
        };
    }
);


/**
 * Add x and y axes to the given svg node.
 */
export const appendAxes = function(elem, {xAxis, yAxis, secondaryYAxis, layout, yTitle, secondaryYTitle}) {

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

    if (secondaryYAxis !== null && secondaryYTitle !== null) {
        const maxXScaleRange = xAxis.scale().range()[1];
        const secondaryYLabelLoc = {
            x: layout.height / -2 + layout.margin.top,
            y: (layout.width - maxXScaleRange) * 1.5
        };
        elem.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${maxXScaleRange}, ${yLoc.y})`)
            .call(secondaryYAxis)
            .append('text')
                .attr('class', 'y-axis-label')
                .attr('transform', 'rotate(-90)')
                .attr('x', secondaryYLabelLoc.x )
                .attr('y', secondaryYLabelLoc.y )
                .text(secondaryYTitle);
    }
};
