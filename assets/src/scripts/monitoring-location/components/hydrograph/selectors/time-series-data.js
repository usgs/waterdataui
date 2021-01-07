import memoize from 'fast-memoize';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import {
    getRequestTimeRange, getCurrentVariable, getCurrentMethodID,
    getMethods
} from 'ml/selectors/time-series-selector';
import {getIanaTimeZone} from 'ml/selectors/time-zone-selector';

const formatTime = function(timeInMillis, timeZone) {
    return DateTime.fromMillis(timeInMillis, {zone: timeZone}).toFormat('L/d/yyyy tt ZZZ');
};

/**
 * Factory function creates a function that:
 * Returns the current show state of a time series.
 * @param  {Object}  state     Redux store
 * @param  {String}  tsKey Time series key
 * @return {Boolean}           Show state of the time series
 */
export const isVisible = memoize(tsKey => (state) => {
    return state.ivTimeSeriesState.showIVTimeSeries[tsKey];
});


/**
 * Returns a Redux selector function which returns the label to be used for the Y axis
 */
export const getYLabel = createSelector(
    getCurrentVariable,
    variable => variable ? variable.variableDescription : ''
);

/*
 * Returns a Redux selector function which returns the label to be used for the secondary y axis
 */
export const getSecondaryYLabel= function() {
    return ''; // placeholder for ticket WDFN-370
};


/**
 * Returns a Redux selector function which returns the title to be used for the hydrograph
 */
export const getTitle = createSelector(
    getCurrentVariable,
    getCurrentMethodID,
    getMethods,
    (variable, methodId, methods) => {
        let title = variable ? variable.variableName : '';
        if (methodId && methods && methods[methodId].methodDescription) {
                title = `${title}, ${methods[methodId].methodDescription}`;
        }
        return title;
    }
);


/*
 * Returns a Redux selector function which returns the description of the hydrograph
 */
export const getDescription = createSelector(
    getCurrentVariable,
    getRequestTimeRange('current', 'P7D'),
    getIanaTimeZone,
    (variable, requestTimeRange, timeZone) => {
        const desc = variable ? variable.variableDescription : '';
        if (requestTimeRange) {
            return `${desc} from ${formatTime(requestTimeRange.start, timeZone)} to ${formatTime(requestTimeRange.end, timeZone)}`;
        } else {
            return desc;
        }
    }
);

/**
 * Returns a Redux selector function which returns the iana time zone or local if none is set
 */
export const getTsTimeZone= createSelector(
    getIanaTimeZone,
    ianaTimeZone => {
        return ianaTimeZone !== null ? ianaTimeZone : 'local';
    }
);

export const getQualifiers = state => state.ivTimeSeriesData.qualifiers;

export const getCurrentVariableUnitCode = createSelector(
    getCurrentVariable,
    variable => variable ? variable.unit.unitCode : null
);

export const getQueryInformation = state => state.ivTimeSeriesData.queryInfo  || {};

