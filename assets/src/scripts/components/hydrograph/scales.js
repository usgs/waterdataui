import {scaleLinear, scaleSymlog} from 'd3-scale';
import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import {getVariables, getCurrentParmCd, getRequestTimeRange, getTimeSeriesForTsKey} from '../../selectors/time-series-selector';
import {convertCelsiusToFahrenheit, convertFahrenheitToCelsius} from '../../utils';

import {getYDomain, SYMLOG_PARMS} from './domain';
import {visiblePointsSelector, pointsByTsKeySelector} from './drawing-data';
import {getLayout} from './layout';
import {TEMPERATURE_PARAMETERS} from './time-series';

const REVERSE_AXIS_PARMS = [
    '72019',
    '61055',
    '99268',
    '99269',
    '72001',
    '72147',
    '72148'
];

/**
 * Create an x-scale oriented on the left
 * @param {Array} timeRange - Object containing the start and end times.
 * @param {Number} xSize - range of scale
 * @return {Object} d3 scale for time.
 */
export const createXScale = function (timeRange, xSize) {
    // xScale is oriented on the left
    let scale = scaleLinear()
        .range([0, xSize]);
    if (timeRange) {
        scale.domain([timeRange.start, timeRange.end]);
    }
    return scale;
};

/**
 * Create the scale based on the parameter code
 *
 * @param {String} parmCd
 * @param {Array} extent
 * @param {Number} size
 */
export const createYScale = function (parmCd, extent, size) {
    if (SYMLOG_PARMS.indexOf(parmCd) >= 0) {
        return scaleSymlog()
            .domain(extent)
            .range([size, 0]);
    } else if (REVERSE_AXIS_PARMS.indexOf(parmCd) >= 0) {
        return scaleLinear()
            .domain(extent)
            .range([0, size]);
    } else {
        return scaleLinear()
            .domain(extent)
            .range([size, 0]);
    }
};


/**
 * Factory function creates a function that, for a given time series key:
 * Selector for x-scale
 * @param  {Object} state       Redux store
 * @return {Function}           D3 scale function
 */
export const getXScale = memoize((kind, tsKey) => createSelector(
    getLayout(kind),
    getRequestTimeRange(tsKey),
        state => state.timeSeriesState.hydrographBrushOffset,
    (layout, requestTimeRange, hydrographBrushOffset) => {
        let timeRange;
        if (kind === 'BRUSH') {
            timeRange = requestTimeRange;
        } else {

            if (hydrographBrushOffset) {

                timeRange = {
                    'start': requestTimeRange.start + hydrographBrushOffset.start,
                    'end': requestTimeRange.end - hydrographBrushOffset.end
                };
            } else {
                timeRange = requestTimeRange;
            }
        }
        return createXScale(timeRange, layout.width - layout.margin.right);
    }
));

export const getMainXScale = (tsKey) => getXScale('MAIN', tsKey);
export const getBrushXScale = (tsKey) => getXScale('BRUSH', tsKey);



/**
 * Selector for y-scale
 * @param  {Object} state   Redux store
 * @return {Function}       D3 scale function
 */
export const getYScale = memoize(kind => createSelector(
    getLayout(kind),
    visiblePointsSelector,
    getCurrentParmCd,
    (layout, pointArrays, currentVarParmCd) => {
        const yDomain = getYDomain(pointArrays, currentVarParmCd);
        return createYScale(currentVarParmCd, yDomain, layout.height - (layout.margin.top + layout.margin.bottom));
    }
));

export const getMainYScale = getYScale();
export const getBrushYScale = getYScale('BRUSH');

export const getSecondaryYScale = memoize(kind => createSelector(
    getLayout(kind),
    visiblePointsSelector,
    getCurrentParmCd,
    (layout, pointArrays, currentVarParmCd) => {
        const yDomain = getYDomain(pointArrays, currentVarParmCd);
        let convertedYDomain = [0, 1];
        if (TEMPERATURE_PARAMETERS.celsius.includes(currentVarParmCd)) {
            convertedYDomain = yDomain.map(celsius => convertCelsiusToFahrenheit(celsius));
        } else if (TEMPERATURE_PARAMETERS.fahrenheit.includes(currentVarParmCd)) {
            convertedYDomain = yDomain.map(fahrenheit => convertFahrenheitToCelsius(fahrenheit));
        } else {
            return null;
        }
        return createYScale(
            currentVarParmCd, convertedYDomain, layout.height - (layout.margin.top + layout.margin.bottom)
        );
    }
));


/**
 * For a given tsKey, return a selector that:
 * Returns lists of time series keyed on parameter code.
 * @param  {String} tsKey             Time series key
 * @return {Object} - keys are parmCd and values are array of array of points
 */
const parmCdPointsSelector = memoize((tsKey, period) => createSelector(
    pointsByTsKeySelector(tsKey, period),
    getTimeSeriesForTsKey(tsKey, period),
    getVariables,
    (tsPoints, timeSeries, variables) => {
        return Object.keys(tsPoints).reduce((byParmCd, tsID) => {
            const points = tsPoints[tsID];
            const parmCd = variables[timeSeries[tsID].variable].variableCode.value;
            byParmCd[parmCd] = byParmCd[parmCd] || [];
            byParmCd[parmCd].push(points);
            return byParmCd;
        }, {});
    }
));


/**
 * Given a dimension with width/height attributes:
 * Returns x and y scales for all "current" time series.
 * @type {Object}   Mapping of parameter code to time series list.
 */
export const timeSeriesScalesByParmCdSelector = memoize((tsKey, period, dimensions) => createSelector(
    parmCdPointsSelector(tsKey, period),
    getRequestTimeRange(tsKey, period),
    (pointsByParmCd, requestTimeRange) => {
        return Object.keys(pointsByParmCd).reduce((tsScales, parmCd) => {
            const tsPoints = pointsByParmCd[parmCd];
            const yDomain = getYDomain(tsPoints, SYMLOG_PARMS.indexOf(parmCd) >= 0);
            tsScales[parmCd] = {
                x: createXScale(requestTimeRange, dimensions.width),
                y: createYScale(parmCd, yDomain, dimensions.height)
            };
            return tsScales;
        }, {});
    }
));
