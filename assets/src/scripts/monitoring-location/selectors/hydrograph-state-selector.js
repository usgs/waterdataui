
export const isCompareIVDataVisible = state => state.hydrographState.showCompareIVData || false;
export const isMedianDataVisible = state => state.hydrographState.showMedianData || false;

export const getSelectedDateRange = state => state.hydrographState.selectedDateRange || null;
export const getSelectedCustomTimeRange = state => state.hydrographState.selectedCustomTimeRange || null;
export const getSelectedParameterCode = state => state.hydrographState.selectedParameterCOde || null;
export const getSelectedIVMethodID = state => state.hydrographState.selectedIVMethodID || null;
export const getGraphCursorOffset = state => state.hydrographState.graphCursorOffset || null;
export const getGraphBrushOffset = state => state.hydrographState.graphBrushOffset || null;
export const getUserInputsForTimeRange = state => state.hydrographState.userInputsForTimeRange || null;

