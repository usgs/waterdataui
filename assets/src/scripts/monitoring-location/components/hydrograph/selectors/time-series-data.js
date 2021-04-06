import memoize from 'fast-memoize';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import config from 'ui/config';

import {getIVData, getGroundwaterLevels, getMedianStatisticsData, getPrimaryMethods, getPrimaryParameter,
    getTimeRange
} from 'ml/selectors/hydrograph-data-selector';
import {getSelectedIVMethodID, isCompareIVDataVisible, isMedianDataVisible} from 'ml/selectors/hydrograph-state-selector';

const formatTime = function(timeInMillis) {
    return DateTime.fromMillis(timeInMillis, {zone: config.locationTimeZone}).toFormat('L/d/yyyy tt ZZZ');
};
/**
 * Returns a Redux selector function which returns whether the dataKind time series is visible
 * @param  {String} dataKind - 'primary', 'compare', 'median'
 * @return {Function}
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

/*
 * Returns a Redux selector that returns true if there is non-empty data and it is
 * selected to be visible.
 * @param {String} dataKind - 'primary' or 'compare'
 * @return {Function}
 */
export const hasVisibleIVData = memoize(dataKind => createSelector(
    isVisible(dataKind),
    getIVData(dataKind),
    getSelectedIVMethodID,
    (isVisible, ivData, selectedIVMethodID) => {
        return isVisible && ivData && ivData.values && selectedIVMethodID in ivData.values ?
            ivData.values[selectedIVMethodID].points.length > 0 : false;
    }
));

export const hasVisibleMedianStatisticsData = createSelector(
    isVisible('median'),
    getMedianStatisticsData,
    (isVisible, medianStats) => isVisible && medianStats ? Object.keys(medianStats).length > 0 : false
);

export const hasVisibleGroundwaterLevels = createSelector(
    getGroundwaterLevels,
    gwLevels => gwLevels && gwLevels.values ? gwLevels.values.length > 0 : false
);

/*
 * Returns a selector function which returns true if there is any data that will be visible
 * on the hydrograph.
 * @return {Function}
 */
export const hasAnyVisibleData = createSelector(
    hasVisibleIVData('primary'),
    hasVisibleIVData('compare'),
    hasVisibleMedianStatisticsData,
    hasVisibleGroundwaterLevels,
    (visiblePrimaryIVData, visibleCompareData, visibleMedianStats, visibleGWLevels) => {
        return visiblePrimaryIVData || visibleCompareData || visibleMedianStats || visibleGWLevels;
    }
);

/**
 * Returns a Redux selector function which returns the title to be used for the hydrograph
 * @return {Function}
 */
export const getTitle = createSelector(
    getPrimaryParameter,
    getSelectedIVMethodID,
    getPrimaryMethods,
    (parameter, methodID, methods) => {
        let title = parameter ? parameter.name : '';
        if (methodID && methods.length > 1) {
            const thisMethod = methods.find(method => method.methodID === methodID);
            if (thisMethod && thisMethod.methodDescription) {
                title = `${title}, ${thisMethod.methodDescription}`;
            }
        }
        return title;
    }
);

/*
 * Returns a Redux selector function which returns the description of the hydrograph
 * @return {Function}
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

/*
 * Returns a Redux selector function which returns the primary parameter's unit code.
 * @return {Function}
 */
export const getPrimaryParameterUnitCode = createSelector(
    getPrimaryParameter,
    parameter => parameter ? parameter.unit : null
);

/*
 * Returns a Redux select which returns the IV data method id with the most points. If more than
 * one method has the same point count, then the time series with the most recent point is chosen.
 * @returns {Function} which returns {String} the preferred method ID.
 */
export const getPreferredIVMethodID = createSelector(
    getIVData('primary'),
    (ivData) => {
        if (!ivData || !Object.keys(ivData.values).length) {
            return null;
        }
        const methodMetaData = Object.values(ivData.values)
            .map(methodValues => {
                return {
                    pointCount: methodValues.points.length,
                    lastPoint: methodValues.points.length ? methodValues.points[methodValues.points.length - 1] : null,
                    methodID: methodValues.method.methodID
                };
            })
            .sort((a, b) => {
                if (a.pointCount === b.pointCount) {
                    return a.pointCount ? a.lastPoint.dateTime - b.lastPoint.dateTime : 0;
                } else {
                    return a.pointCount - b.pointCount;
                }
            });
        return methodMetaData[methodMetaData.length - 1].methodID;
    }
);


/**
 * Returns a array of methods sorted from most to least points in the selected time span.
 * @return {Array} Array of objects with details about the sampling methods available for the primary parameter.
 */
export const getSortedIVMethods = createSelector(
    getIVData('primary'),
    (ivData) => {
        if (!ivData || !Object.keys(ivData.values).length) {
            return null;
        }
        const methodsForPrimarySelection = Object.values(ivData.values)
            .map(methodValues => {
                return {
                    pointCount: methodValues.points.length,
                    lastPoint: methodValues.points.length ? methodValues.points[methodValues.points.length - 1] : null,
                    methodID: methodValues.method.methodID,
                    methodDescription: methodValues.method.methodDescription
                };
            })
            .sort((a, b) => {
                if (a.pointCount === b.pointCount) {
                    return a.pointCount ? a.lastPoint.dateTime - b.lastPoint.dateTime : 0;
                } else {
                    return a.pointCount - b.pointCount;
                }
            });
        return methodsForPrimarySelection.reverse();
    }
);
