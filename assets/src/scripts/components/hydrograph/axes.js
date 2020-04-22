import {axisBottom, axisLeft, axisRight} from 'd3-axis';
import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import {generateTimeTicks} from '../../d3-rendering/tick-marks';
import {getCurrentDateRangeKind, getCurrentParmCd} from '../../selectors/time-series-selector';
import {convertCelsiusToFahrenheit, convertFahrenheitToCelsius} from '../../utils';

import {getYTickDetails} from './domain';
import {getLayout} from './layout';
import {getXScale, getBrushXScale, getYScale, getSecondaryYScale} from './scales';
import {yLabelSelector, secondaryYLabelSelector, tsTimeZoneSelector, TEMPERATURE_PARAMETERS} from './time-series';

const createXAxis = function(xScale,  period, ianaTimeZone) {
    const [startMillis, endMillis] = xScale.domain();
    const ticks = generateTimeTicks(startMillis, endMillis, ianaTimeZone);
    return axisBottom()
        .scale(xScale)
        .tickValues(ticks.dates)
        .tickSizeOuter(0)
        .tickFormat(ticks.format);
};

/**
 * Create an x and y axis for hydrograph
 * @param {Object} xScale      D3 Scale object for the x-axis
 * @param {Object} yScale      D3 Scale object for the y-axis
 * @param {Object} secondaryYscale - D3 Scale object for the secondary y-axis
 * @param {Number} yTickSize   Size of inner ticks for the y-axis
 * @param {String} parmCd - parameter code of time series to be shown on the graph.
 * @param {String} period - ISO duration for date range of the time series
 * @param {String} ianaTimeZone - Internet Assigned Numbers Authority designation for a time zone
 * @return {Object} {xAxis, yAxis, secondardYaxis} - D3 Axis
 */
export const createAxes = function(xScale, yScale, secondaryYScale, yTickSize, parmCd, period, ianaTimeZone) {
    // Create x-axis
    const xAxis = createXAxis(xScale, period, ianaTimeZone);

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
 * Selector that returns the brush x axis
 */
export const getBrushXAxis = createSelector(
    getBrushXScale('current'),
    tsTimeZoneSelector,
    getCurrentDateRangeKind,
    (xScale, ianaTimeZone, period) => createXAxis(xScale, period, ianaTimeZone)
);

/**
 * Returns data necessary to render the graph axes.
 * @return {Object}
 */
export const getAxes = memoize(kind => createSelector(
    getXScale(kind, 'current'),
    getYScale(kind),
    getSecondaryYScale(kind),
    getLayout(kind),
    yLabelSelector,
    tsTimeZoneSelector,
    getCurrentParmCd,
    getCurrentDateRangeKind,
    secondaryYLabelSelector,
    (xScale, yScale, secondaryYScale, layout, plotYLabel, ianaTimeZone, parmCd, currentDateRange, plotSecondaryYLabel) => {
        return {
            ...createAxes(
                xScale,
                yScale,
                secondaryYScale,
                -layout.width + layout.margin.right,
                parmCd,
                currentDateRange,
                ianaTimeZone
            ),
            layout: layout,
            yTitle: plotYLabel,
            secondaryYTitle: plotSecondaryYLabel
        };
    }
));