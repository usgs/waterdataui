import memoize from 'fast-memoize';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import {
    getRequestTimeRange, getCurrentVariable, getTimeSeriesForTsKey, getCurrentParmCd, getCurrentMethodID,
    getMethods
} from '../../selectors/time-series-selector';
import {getIanaTimeZone} from '../../selectors/time-zone-selector';


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


export const hasTimeSeriesWithPoints = memoize((tsKey, period) => createSelector(
    getTimeSeriesForTsKey(tsKey, period),
    (timeSeries) => {
        const seriesWithPoints = Object.values(timeSeries).filter(x => x.points.length > 0);
        return seriesWithPoints.length > 0;
}));


/**
 * Factory function creates a function that:
 * Returns the current show state of a time series.
 * @param  {Object}  state     Redux store
 * @param  {String}  tsKey Time series key
 * @return {Boolean}           Show state of the time series
 */
export const isVisibleSelector = memoize(tsKey => (state) => {
    return state.timeSeriesState.showSeries[tsKey];
});



/**
 * @return {String}     The label for the y-axis
 */
export const yLabelSelector = createSelector(
    getCurrentVariable,
    variable => variable ? variable.variableDescription : ''
);


export const secondaryYLabelSelector = createSelector(
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
 * @return {String}     The title to include in the hyrdograph, will include method description if defined.
 */
export const titleSelector = createSelector(
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


/**
 * @return {String}     Description for the currently display set of time
 *                      series
 */
export const descriptionSelector = createSelector(
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
 * Select the time zone. If the time zone is null, use `local` as the time zone
 *
 * @ return {String} - IANA time zone
 *
 */
export const tsTimeZoneSelector = createSelector(
    getIanaTimeZone,
    ianaTimeZone => {
        return ianaTimeZone !== null ? ianaTimeZone : 'local';
    }
);
