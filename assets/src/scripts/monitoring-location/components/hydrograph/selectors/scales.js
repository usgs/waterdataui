import {scaleLinear, scaleSymlog} from 'd3-scale';
import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import {getVariables, getCurrentParmCd, getRequestTimeRange, getTimeSeriesForTsKey} from 'ml/selectors/time-series-selector';

import {getYDomain, getYDomainForVisiblePoints, SYMLOG_PARMS} from './domain';
import {getPointsByTsKey} from './drawing-data';
import {getLayout} from './layout';
import {getIVGraphBrushOffset} from "../../../selectors/time-series-selector";


const REVERSE_AXIS_PARMS = [
    '72019',
    '61055',
    '99268',
    '99269',
    '72001',
    '72147',
    '72148'
];

/* The two create* functions are helper functions. They are exported primariy
 * for ease of testing
 */

/**
 * Create an x-scale oriented on the left
 * @param {Array} timeRange - Object containing the start and end times.
 * @param {Number} xSize - range of scale
 * @return {Object} d3 scale for time.
 */
export const createXScale = function(timeRange, xSize) {
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
export const createYScale = function(parmCd, extent, size) {
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

/*
 * Selector function which returns the time range visible for the kind of graph and tsKey
 * @param {String} kind - "BRUSH" or "MAIN"
 * @param {String tsKey - 'current' or 'compare'
 * @return {Function} - which returns an {Object} with properties start, end {Number}.
 */
export const getTimeRange = memoize((kind, tsKey) => createSelector(
    getRequestTimeRange(tsKey),
    getIVGraphBrushOffset,
    (timeRange, brushOffset) => {
        let result;

        if (kind === 'BRUSH') {
            result = timeRange;
        } else {
            if (brushOffset && timeRange) {
                result = {
                    'start': timeRange.start + brushOffset.start,
                    'end': timeRange.end - brushOffset.end
                };
            } else {
                result = timeRange;
            }
        }
        return result;
    }
));


/**
 * Factory function creates a function that, for a given time series key:
 * Selector for x-scale
 * @param  {Object} state       Redux store
 * @return {Function}           D3 scale function
 */
export const getXScale = memoize((kind, tsKey) => createSelector(
    getLayout(kind),
    getTimeRange(kind, tsKey),
    (layout, timeRange) => {
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
    getYDomainForVisiblePoints,
    getCurrentParmCd,
    (layout, yDomain, currentVarParmCd) => {
        return createYScale(currentVarParmCd, yDomain, layout.height - (layout.margin.top + layout.margin.bottom));
    }
));

export const getMainYScale = getYScale();
export const getBrushYScale = getYScale('BRUSH');

export const getSecondaryYScale = memoize(kind => createSelector(
    getLayout(kind),
    getYDomainForVisiblePoints,
    getCurrentParmCd,
    (layout, yDomain, currentVarParmCd) => {
// leaving constant this as a placeholder for changes upcoming in ticket WDFN-370
        return createYScale(
            currentVarParmCd, layout.height - (layout.margin.top + layout.margin.bottom)
        );
    }
));


/**
 * For a given tsKey, return a selector that:
 * Returns lists of time series keyed on parameter code.
 * @param  {String} tsKey             Time series key
 * @return {Object} - keys are parmCd and values are array of array of points
 */
const getParmCdPoints = memoize((tsKey, period) => createSelector(
    getPointsByTsKey(tsKey, period),
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
export const getTimeSeriesScalesByParmCd= memoize((tsKey, period, dimensions) => createSelector(
    getParmCdPoints(tsKey, period),
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
