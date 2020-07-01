import memoize from 'fast-memoize';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import {
    getRequestTimeRange, getCurrentVariable, getTimeSeriesForTsKey, getCurrentParmCd, getCurrentMethodID,
    getMethods
} from '../../../selectors/time-series-selector';
import {getIanaTimeZone} from '../../../selectors/time-zone-selector';


export const TEMPERATURE_PARAMETERS = {
    celsius: [
        '00010',
        '00020',
        '45587',
        '45589',
        '50011',
        '72176',
        '72282',
        '72283',
        '72329',
        '81027',
        '81029',
        '85583',
        '99229',
        '99230'
    ],
    fahrenheit: [
        '00011',
        '00021',
        '45590'
    ]
};



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
export const getSecondaryYLabel= createSelector(
    getCurrentParmCd,
    parmCd => {
        let secondaryYLabel = null;
        if (TEMPERATURE_PARAMETERS.celsius.includes(parmCd)) {
            secondaryYLabel = 'degrees Fahrenheit';
        } else if(TEMPERATURE_PARAMETERS.fahrenheit.includes(parmCd)) {
            secondaryYLabel = 'degrees Celsius';
        }
        return secondaryYLabel;
    }
);


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
