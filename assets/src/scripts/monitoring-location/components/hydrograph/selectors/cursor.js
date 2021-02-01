import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import {getNearestTime} from 'ui/utils';

import {getCurrentMethodID} from 'ml/selectors/time-series-selector';

import {getVisibleGroundwaterLevelPoints} from './discrete-data';
import {getCurrentVariablePointsByTsId} from './drawing-data';
import {getMainXScale, getMainYScale, getTimeRange} from './scales';
import {isVisible} from './time-series-data';

const isInTimeRange = function(dateTime, timeRange) {
    return dateTime >= timeRange.start && dateTime <= timeRange.end;
};

export const getCursorOffset = createSelector(
    getMainXScale('current'),
    state => state.ivTimeSeriesState.ivGraphCursorOffset,
    (xScale, cursorOffset) => {
        // If cursorOffset is false, don't show it
        if (cursorOffset === false) {
            return null;
        // If cursorOffset is otherwise unset, default to the last offset
        } else if (!cursorOffset) {
            const domain = xScale.domain();
            return domain[1] - domain[0];
        } else {
            return cursorOffset;
        }
    }
);

/**
 * Returns a selector that, for a given tsKey:
 * Returns the time corresponding to the current cursor offset.
 * @param  {String} tsKey
 * @return {Date}
 */
export const getCursorTime = memoize(tsKey => createSelector(
    getCursorOffset,
    getMainXScale(tsKey),
    (cursorOffset, xScale) => {
        return cursorOffset ? new Date(xScale.domain()[0] + cursorOffset) : null;
    }
));

/*
 * Returns a Redux selector function that returns the time series data point nearest
 * the tooltip focus time for the current time series with the current variable and current method
 * @param {Object} state - Redux store
 * @param String} tsKey - Time series key
 * @return {Object}
 */
export const getTsCursorPoints = memoize(tsKey => createSelector(
    getCurrentVariablePointsByTsId(tsKey),
    getCurrentMethodID,
    getCursorTime(tsKey),
    isVisible(tsKey),
    getTimeRange('MAIN', tsKey),
    (timeSeries, currentMethodId, cursorTime, isVisible, timeRange) => {
        if (!cursorTime || !isVisible || !timeRange) {
            return {};
        }
        return Object.keys(timeSeries).reduce((data, tsId) => {
            if (timeSeries[tsId].length && parseInt(tsId.split(':')[0]) === currentMethodId) {
                const visiblePoints = timeSeries[tsId].filter(point => isInTimeRange(point.dateTime, timeRange));
                if (visiblePoints.length) {
                    const datum = getNearestTime(visiblePoints, cursorTime);
                    data[tsId] = {
                        ...datum,
                        tsKey: tsKey
                    };
                }
            }
            return data;
        }, {});
    }));

/*
 * Returns a function that returns the time series data point nearest the
 * tooltip focus time for the given time series key. Only returns those points
 * where the y-value is finite; no use in making a point if y is Infinity.
 *
 * @param {Object} state - Redux store
 * @param {String} tsKey - Time series key
 * @return {Function} which returns an {Array of Object} tooltipPoints - Each
 *      object has x and y properties.
 */
export const getTooltipPoints = memoize(tsKey => createSelector(
    getMainXScale(tsKey),
    getMainYScale,
    getTsCursorPoints(tsKey),
    (xScale, yScale, cursorPoints) => {
        return Object.keys(cursorPoints).reduce((tooltipPoints, tsID) => {
            const cursorPoint = cursorPoints[tsID];
            if (isFinite(yScale(cursorPoint.value))) {
                tooltipPoints.push({
                    x: xScale(cursorPoint.dateTime),
                    y: yScale(cursorPoint.value)
                });
            }
            return tooltipPoints;
        }, []);
    }
));

/*
 * Redux selector function that returns a function that returns the nearest ground water level point
 * @return {Function] - the function returns an object with dateTime, value, and qualifier attributes. Null
 *      is returned if there are no visible groundwater level points or the cursor is not
 *      on the graph
 */
export const getGroundwaterLevelCursorPoint = createSelector(
    getVisibleGroundwaterLevelPoints,
    getCursorTime('current'),
    getTimeRange('MAIN', 'current'),
    (gwLevelPoints, cursorTime, timeRange) => {
        if (!cursorTime || !gwLevelPoints.length || !timeRange) {
            return null;
        }
        const visiblePoints = gwLevelPoints.filter(point => isInTimeRange(point.dateTime, timeRange));
        if (visiblePoints.length) {
            return getNearestTime(visiblePoints, cursorTime);
        } else {
            return null;
        }
});

/*
 * Redux Selector function which returns a function which returns an Object for
 * the nearest groundwater level containing x and y coordinates
 * @return {Function} - which returns null if no ground water levels or
 * an Object containing x and y properties
 */
export const getGroundwaterLevelTooltipPoint = createSelector(
    getGroundwaterLevelCursorPoint,
    getMainXScale('current'),
    getMainYScale,
    (point, xScale, yScale) => {
        if (!point) {
            return null;
        }
        return {
            x: xScale(point.dateTime),
            y: yScale(point.value)
        };
    }
);
