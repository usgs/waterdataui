
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import config from 'ui/config';

/*
 * The following selector functions return a function which returns the selected data.
 */
export const isCompareIVDataVisible = state => state.hydrographState.showCompareIVData || false;
export const isMedianDataVisible = state => state.hydrographState.showMedianData || false;
export const getSelectedDateRange = state => state.hydrographState.selectedDateRange || null;
export const getSelectedCustomDateRange = state => state.hydrographState.selectedCustomDateRange || null;
export const getSelectedParameterCode = state => state.hydrographState.selectedParameterCode || null;
export const getSelectedIVMethodID = state => state.hydrographState.selectedIVMethodID || null;
export const getGraphCursorOffset = state => state.hydrographState.graphCursorOffset || null;
export const getGraphBrushOffset = state => state.hydrographState.graphBrushOffset || null;

/*
 * Returns a selector function that returns an Object that can be used when calling
 * hydrographDataReducer action that retrieves data for the hydrograph
 * @return {Function}
 */
export const getInputsForRetrieval = createSelector(
    getSelectedParameterCode,
    getSelectedDateRange,
    getSelectedCustomDateRange,
    isCompareIVDataVisible,
    isMedianDataVisible,
    (parameterCode, selectedDateRange, selectedCustomDateRange, loadCompare, loadMedian) => {
        const isCustomTime = selectedDateRange === 'custom';
        const period = isCustomTime ? null : selectedDateRange;
        const startTime = isCustomTime ?
            DateTime.fromISO(selectedCustomDateRange.start, {zone: config.locationTimeZone}).toISO() : null;
        const endTime = isCustomTime ?
            DateTime.fromISO(selectedCustomDateRange.end, {zone: config.locationTimeZone}).endOf('day').toISO() : null;

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
