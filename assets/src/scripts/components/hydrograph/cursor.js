import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

import config from '../../config';
import {getCurrentMethodID} from '../../selectors/time-series-selector';
import {getNearestTime} from '../../utils';

import {currentVariablePointsByTsIdSelector} from './drawing-data';
import {getMainXScale} from './scales';
import {isVisibleSelector} from './time-series';


export const cursorOffsetSelector = createSelector(
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
export const cursorTimeSelector = memoize(tsKey => createSelector(
    cursorOffsetSelector,
    getMainXScale(tsKey),
    (cursorOffset, xScale) => {
        return cursorOffset ? new Date(xScale.domain()[0] + cursorOffset) : null;
    }
));

/*
 * Returns a function that the time series data point nearest the tooltip focus time for the given time series
 * with the current variable and current method
 * @param {Object} state - Redux store
 * @param String} tsKey - Time series key
 * @return {Object}
 */
export const tsCursorPointsSelector = memoize(tsKey => createSelector(
    currentVariablePointsByTsIdSelector(tsKey),
    getCurrentMethodID,
    cursorTimeSelector(tsKey),
    isVisibleSelector(tsKey),
    (timeSeries, currentMethodId, cursorTime, isVisible) => {
        if (!cursorTime || !isVisible) {
            return {};
        }
        return Object.keys(timeSeries).reduce((data, tsId) => {
            if (timeSeries[tsId].length &&
                (!config.MULTIPLE_TIME_SERIES_METADATA_SELECTOR_ENABLED || parseInt(tsId.split(':')[0]) === currentMethodId)) {
                const datum = getNearestTime(timeSeries[tsId], cursorTime);
                data[tsId] = {
                    ...datum,
                    tsKey: tsKey
                };
            }
            return data;
        }, {});
    }));