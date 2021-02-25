import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import {getNearestTime} from 'ui/utils';

import {getSelectedIVMethodID, getGraphCursorOffset} from 'ml/selectors/hydrograph-state-selector';

import {getGroundwaterLevelPoints} from './discrete-data';
import {getIVDataPoints} from './iv-data';
import {getMainXScale, getMainYScale, getGraphTimeRange} from './scales';
import {isVisible} from './time-series-data';

const isInTimeRange = function(dateTime, timeRange) {
    return dateTime >= timeRange.start && dateTime <= timeRange.end;
};

/*
 * Returns a selector function which returns the cursor offset. If null then
 * set to range of the xScale.
 */
export const getCursorOffset = createSelector(
    getMainXScale('current'),
    getGraphCursorOffset,
    (xScale, cursorOffset) => {
        if (!cursorOffset) {
            const domain = xScale.domain();
            return domain[1] - domain[0];
        } else {
            return cursorOffset;
        }
    }
);

/**
 * Returns a selector that, for a given timeRangeKind
 * Returns the time corresponding to the current cursor offset.
 * @param  {String} timeRangeKind - 'current' or 'prioryear'
 * @return {Date}
 */
export const getCursorTime = memoize(timeRangeKind => createSelector(
    getCursorOffset,
    getMainXScale(timeRangeKind),
    (cursorOffset, xScale) => {
        return cursorOffset ? new Date(xScale.domain()[0] + cursorOffset) : null;
    }
));

/*
 * Returns a Redux selector function that returns the time series data point nearest
 * the tooltip focus time for the dataKind and timeRangeKind and the selected method
 * @param {String} dataKind - 'primary' or 'compare'
 * @param {String} timeRangeKind - 'current' or 'prioryear'
 * @return {Object} or null
 */
export const getIVDataCursorPoint = memoize((dataKind, timeRangeKind) => createSelector(
    getIVDataPoints(dataKind),
    getSelectedIVMethodID,
    getCursorTime(timeRangeKind),
    isVisible(dataKind),
    getGraphTimeRange('MAIN', timeRangeKind),
    (ivData, selectedMethodID, cursorTime, isVisible, timeRange) => {
        if (!ivData || !cursorTime || !isVisible || !timeRange || !selectedMethodID || !(selectedMethodID in ivData)) {
            return null;
        }
        const visiblePoints = ivData[selectedMethodID].filter(point => isInTimeRange(point.dateTime, timeRange));
        if (!visiblePoints.length) {
            return null;
        }
        const datum = getNearestTime(visiblePoints, cursorTime);
        return {
            ...datum,
            dataKind: dataKind
        };
    }));

/*
 * Returns a function that returns the time series data point nearest the
 * tooltip focus time for the given dataKind and timeRangeKind. Returns null if y value is infinite;
 * no use in making a point if y is Infinity.
 *
 * @param {String} dataKind - 'primary' or 'compare'
 * @param {String} timeRangeKind - 'current' or 'prioryear'
 * @return {Function} which returns an {Object} with x and y properties
 */
export const getIVDataTooltipPoint = memoize((dataKind, timeRangeKind) => createSelector(
    getMainXScale(timeRangeKind),
    getMainYScale,
    getIVDataCursorPoint(dataKind, timeRangeKind),
    (xScale, yScale, cursorPoint) => {
        if (cursorPoint && isFinite(yScale(cursorPoint.value))) {
            return {
                x: xScale(cursorPoint.dateTime),
                y: yScale(cursorPoint.value)
            };
        } else {
            return null;
        }
    }
));

/*
 * Redux selector function that returns a function that returns the nearest ground water level point
 * @return {Function] - the function returns an object with dateTime, value, and qualifier attributes. Null
 *      is returned if there are no visible groundwater level points or the cursor is not
 *      on the graph
 */
export const getGroundwaterLevelCursorPoint = createSelector(
    getGroundwaterLevelPoints,
    getCursorTime('current'),
    getGraphTimeRange('MAIN', 'current'),
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
