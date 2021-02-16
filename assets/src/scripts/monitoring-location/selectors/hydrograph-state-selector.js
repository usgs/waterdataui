
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

export const isCompareIVDataVisible = state => state.hydrographState.showCompareIVData || false;
export const isMedianDataVisible = state => state.hydrographState.showMedianData || false;

export const getSelectedDateRange = state => state.hydrographState.selectedDateRange || null;
export const getSelectedCustomTimeRange = state => state.hydrographState.selectedCustomTimeRange || null;
export const getSelectedParameterCode = state => state.hydrographState.selectedParameterCode || null;
export const getSelectedIVMethodID = state => state.hydrographState.selectedIVMethodID || null;
export const getGraphCursorOffset = state => state.hydrographState.graphCursorOffset || null;
export const getGraphBrushOffset = state => state.hydrographState.graphBrushOffset || null;
export const getUserInputsForTimeRange = state => state.hydrographState.userInputsForTimeRange || null;

export const getInputsForRetrieval = createSelector(
    getSelectedParameterCode,
    getSelectedDateRange,
    getSelectedCustomTimeRange,
    isCompareIVDataVisible,
    isMedianDataVisible,
    (parameterCode, selectedDateRange, selectedCustomTimeRange, loadCompare, loadMedian) => {
        const isCustomTime = selectedDateRange === 'custom';
        const period = isCustomTime ? null : selectedDateRange;
        const startTime = isCustomTime ? DateTime.toISO(DateTime.fromMillis(selectedCustomTimeRange.start)) : null;
        const endTime = isCustomTime ? DateTime.toISO(DateTime.fromMillis(selectedCustomTimeRange.end)) : null;

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
