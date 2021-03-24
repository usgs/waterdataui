
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import config from 'ui/config';

/*
 * The following selector functions return a function which returns the selected data.
 */
export const isCompareIVDataVisible = state => state.hydrographState.showCompareIVData || false;
export const isMedianDataVisible = state => state.hydrographState.showMedianData || false;
export const getSelectedTimeSpan = state => state.hydrographState.selectedTimeSpan || null;
export const getSelectedParameterCode = state => state.hydrographState.selectedParameterCode || null;
export const getSelectedIVMethodID = state => state.hydrographState.selectedIVMethodID || null;
export const getGraphCursorOffset = state => state.hydrographState.graphCursorOffset || null;
export const getGraphBrushOffset = state => state.hydrographState.graphBrushOffset || null;

/*
 * Returns a selector function that returns an Object that can be used when calling
 * hydrographDataReducer action that retrieves data for the hydrograph. Note that is the timeSpan
 * represents a date range, the returned startTime is at midnight on the start date and the
 * endTime is 11:59:59 of the end date
 * @return {Function}
 */
export const getInputsForRetrieval = createSelector(
    getSelectedParameterCode,
    getSelectedTimeSpan,
    isCompareIVDataVisible,
    isMedianDataVisible,
    (parameterCode, selectedTimeSpan, loadCompare, loadMedian) => {
        const timeSpanIsDuration = typeof selectedTimeSpan === 'string';
        const period = timeSpanIsDuration ? selectedTimeSpan : null;
        const startTime = timeSpanIsDuration ?
            null: DateTime.fromISO(selectedTimeSpan.start, {zone: config.locationTimeZone}).toISO();
        const endTime = timeSpanIsDuration ?
            null: DateTime.fromISO(selectedTimeSpan.end, {zone: config.locationTimeZone}).endOf('day').toISO();

        return {
            parameterCode,
            period,
            startTime,
            endTime,
            loadCompare,
            loadMedian
        };
    }
);
