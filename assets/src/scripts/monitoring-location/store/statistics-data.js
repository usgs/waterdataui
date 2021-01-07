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
*  Helper function that takes a group of statistics and checks if any of those are temperatures in celsius. If found,
* the function will convert to Fahrenheit and add the new temperatures to the statistics group.
* @param {Object} The median statistics
* @return {Object} The median statistics, possibly with converted temperatures added
*/
export const convertCelsiusToFahrenheitAndAddToStats = function(stats) {
    Object.entries(stats).forEach(stat => {

        if (config.CELSIUS_TEMPERATURE_PARAMETERS.includes(stat[0])) {
            const convertedStat = cloneDeep(stat[1]);
            const dailyStatDetails = Object.entries(convertedStat)[0][1];
            dailyStatDetails.forEach(detail => {
                detail.p50_va = convertCelsiusToFahrenheit(detail.p50_va);
            });
            // add the new key value pair to the stats object
            stats[`${stat[0]}${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`] = convertedStat;
        }
    });

    return stats;
};

/*
 * Asynchronous Redux action to fetch the all median statistics data for a site
 * @param {String} siteno
 * @return {Function} which returns a promise once the data has been fetched
 */
const retrieveMedianStatistics = function(siteno) {
    return function(dispatch) {
        return fetchSiteStatistics({siteno, statType: 'median'}).then((stats) => {
            stats = convertCelsiusToFahrenheitAndAddToStats(stats);
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
