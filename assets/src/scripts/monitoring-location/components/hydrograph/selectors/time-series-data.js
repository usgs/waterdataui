import memoize from 'fast-memoize';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import config from 'ui/config';

import {getPrimaryMethods, getPrimaryParameter, getTimeRange} from 'ml/selectors/hydrograph-data-selector';
import {getSelectedIVMethodID, isCompareIVDataVisible, isMedianDataVisible} from 'ml/selectors/hydrograph-state-selector';

const formatTime = function(timeInMillis) {
    return DateTime.fromMillis(timeInMillis, {zone: config.locationTimeZone}).toFormat('L/d/yyyy tt ZZZ');
};
/**
 * Factory function creates a function that:
 * Returns the current show state of a time series.
 * @param  {Object}  state     Redux store
 * @param  {String}  tsKey Time series key
 * @return {Boolean}           Show state of the time series
 */
export const isVisible = memoize(dataKind => createSelector(
    isCompareIVDataVisible,
    isMedianDataVisible,
    (compareVisible, medianVisible) => {
        switch (dataKind) {
            case 'primary':
                return true;
            case 'compare':
                return compareVisible;
            case 'median':
                return medianVisible;
            default:
                return false;
        }
    })
);

/**
 * Returns a Redux selector function which returns the label to be used for the Y axis
 */
export const getYLabel = createSelector(
    getPrimaryParameter,
    parameter => parameter ? parameter.description : ''
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
    getPrimaryParameter,
    getSelectedIVMethodID,
    getPrimaryMethods,
    (parameter, methodID, methods) => {
        let title = parameter ? parameter.name : '';
        if (methodID && methods.length) {
            const thisMethod = methods.find(method => method.methodID === methodID);
            if (thisMethod.methodDescription) {
                title = `${title}, $${thisMethod.methodDescription}`;
            }
        }
        return title;
    }
);


/*
 * Returns a Redux selector function which returns the description of the hydrograph
 */
export const getDescription = createSelector(
    getPrimaryParameter,
    getTimeRange('current'),
    (parameter, timeRange) => {
        let result = parameter ? parameter.description : '';
        if (timeRange) {
            result = `${result} from ${formatTime(timeRange.start)} to ${formatTime(timeRange.end)}`;
        }
        return result;
    }
);

export const getPrimaryParameterUnitCode = createSelector(
    getPrimaryParameter,
    parameter => parameter ? parameter.unit : null
);
