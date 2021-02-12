import {scaleLinear, scaleSymlog} from 'd3-scale';
import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import {
    getPrimaryParameter,
    getTimeRange
} from 'ml/selectors/hydrograph-data-selector';
import {getGraphBrushOffset} from 'ml/selectors/hydrograph-state-selector';

import {SYMLOG_PARMS, getPrimaryValueRange} from './domain';
import {getLayout} from './layout';


const REVERSE_AXIS_PARMS = [
    '72019',
    '61055',
    '99268',
    '99269',
    '72001',
    '72147',
    '72148'
];

/* The two create* functions are helper functions. They are exported primarily
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
 * @param {String} parameterCode
 * @param {Array} extent
 * @param {Number} size
 */
export const createYScale = function(parameterCode, extent, size) {
    if (SYMLOG_PARMS.indexOf(parameterCode) >= 0) {
        return scaleSymlog()
            .domain(extent)
            .range([size, 0]);
    } else if (REVERSE_AXIS_PARMS.indexOf(parameterCode) >= 0) {
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
 * @param {String} graphKind - "BRUSH" or "MAIN"
 * @param {String} timeRangeKind - 'current' or 'prioryear'
 * @return {Function} - which returns an {Object} with properties start, end {Number}.
 */
export const getGraphTimeRange = memoize((graphKind, timeRangeKind) => createSelector(
    getTimeRange(timeRangeKind),
    getGraphBrushOffset,
    (timeRange, brushOffset) => {
        let result;

        if (graphKind === 'BRUSH') {
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
 * Selector function which returns a function which returns the xscale for
 * a D3 graph of graphKind ("BRUSH' or 'MAIN') and timeRangeKind(current, prioryear)
 * @param  {Object} state       Redux store
 * @return {Function}           D3 scale function
 */
export const getXScale = memoize((graphKind, timeRangeKind) => createSelector(
    getLayout(graphKind),
    getGraphTimeRange(graphKind, timeRangeKind),
    (layout, timeRange) => {
        return createXScale(timeRange, layout.width - layout.margin.right);
    }
));

export const getMainXScale = (timeRangeKind) => getXScale('MAIN', timeRangeKind);
export const getBrushXScale = getXScale('BRUSH', 'current');

/**
 * Selector for y-scale
 * @param  {Object} state   Redux store
 * @return {Function}       D3 scale function
 */
export const getYScale = memoize(graphKind => createSelector(
    getLayout(graphKind),
    getPrimaryValueRange,
    getPrimaryParameter,
    (layout, yDomain, parameter) => {
        return createYScale(parameter ? parameter.parameterCode : '', yDomain, layout.height - (layout.margin.top + layout.margin.bottom));
    }
));

export const getMainYScale = getYScale();
export const getBrushYScale = getYScale('BRUSH');
