import cloneDeep from 'lodash/cloneDeep';

import config from 'ui/config';
import {convertCelsiusToFahrenheit} from 'ui/utils';
import {fetchSiteStatistics} from 'ui/web-services/statistics-data';

const INITIAL_DATA = {
    median: {}
};

/*
 * Synchronous Redux action to update the median statistics data.
 * @param {Object} statisticsData data where keys are the parameter codes for which median stats are available
 * @return {Object} Redux action
 */
const setMedianStats = function(statisticsData) {
    return {
        type: 'SET_MEDIAN_STATS',
        statisticsData
    };
};

/*
*  Helper function that takes a group of median value Celsius temperature statistics and converts to Fahrenheit.
* @param {Object} clonedStatGroup - An object grouped by method IDs that contains a cloned copy of temperature value statistics
* @return {Object} clonedStatGroup - The median statistics with converted temperatures
*/
const convertMethodStatsFromCelsiusToFahrenheit = function(clonedStatGroup) {
        Object.entries(clonedStatGroup).forEach(statEntry => {
            statEntry[1].forEach(detail => {
                detail.p50_va = convertCelsiusToFahrenheit(detail.p50_va);
            });
        });

    return clonedStatGroup;
};

/*
 * Asynchronous Redux action to fetch the all median statistics data for a site
 * @param {String} siteno
 * @return {Function} which returns a promise once the data has been fetched
 */
const retrieveMedianStatistics = function(siteno) {
    return function(dispatch) {
        return fetchSiteStatistics({siteno, statType: 'median'}).then((stats) => {
            Object.entries(stats).forEach(parameterStatGroup => {
                const parameterCode = parameterStatGroup[0];
                const methodGroupings = parameterStatGroup[1];
                if (config.TEMPERATURE_PARAMETERS.celsius.includes(parameterCode)) {
                    const convertedStatGroup = convertMethodStatsFromCelsiusToFahrenheit(cloneDeep(methodGroupings));

                    stats = {
                        ...stats,
                        [`${parameterCode}${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`]: convertedStatGroup
                    };
                }
            });

            dispatch(setMedianStats(stats));
        });
    };
};

/*
 * slice reducer
 */
export const statisticsDataReducer = function(statisticsData=INITIAL_DATA, action) {
    switch(action.type) {
        case 'SET_MEDIAN_STATS':
            return {
                ...statisticsData,
                median: action.statisticsData
            };

        default: return statisticsData;
    }
};

export const Actions = {
    setMedianStats,
    retrieveMedianStatistics
};
