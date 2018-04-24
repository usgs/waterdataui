const memoize = require('fast-memoize');
const { createSelector } = require('reselect');


export const variablesSelector = state => state.series.variables ? state.series.variables : null;

export const currentVariableIDSelector = state => state.timeseriesState.currentVariableID;
export const currentDateRangeSelector = state => state.timeseriesState.currentDateRange;

/**
 * @return {Object}     Variable details for the currently selected variable.
 */
export const currentVariableSelector = createSelector(
    variablesSelector,
    currentVariableIDSelector,
    (variables, variableID) => {
        return variableID ? variables[variableID] : null;
    }
);

export const currentParmCdSelector = createSelector(
    currentVariableSelector,
    (currentVar) => {
        return currentVar && currentVar.variableCode ? currentVar.variableCode.value : null;
    }
);

export const hasFetchedTimeseries = memoize((tsKey) => {
    return state => state.series.requests[tsKey] ? true : false;
});

export const timeseriesRequestKeySelector = memoize(tsKey => memoize(period => createSelector(
    currentParmCdSelector,
    currentDateRangeSelector,
    (parmCd, currentPeriod) => {
        const periodToUse = period ? period : currentPeriod;
        return tsKey === 'median' || periodToUse === 'P7D' ? tsKey : `${tsKey}:${periodToUse}:${parmCd}`;
    })
));
