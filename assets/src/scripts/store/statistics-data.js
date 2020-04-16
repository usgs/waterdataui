import {fetchSiteStatistics} from '../web-services/statistics-data';

const INITIAL_DATA = {
    median: {}
};

/*
 * Synchronous Redux action to update the median statistics data.
 * @param {Object} statisticsData data where keys are the parameter codes for which median stats are available
 * @return {Function} which returns a Redux action
 */
const setMedianStats = function(statisticsData) {
    return {
        type: 'SET_MEDIAN_STATS',
        statisticsData
    };
};

/*
 * Asynchronous Redux action to fetch the all median statistics data for a site
 * @param {String} siteno
 * @return {Function} which returns a promise once the data has been fetched
 */
const retrieveMedianStatistics = function(siteno) {
    return function(dispatch) {
        return fetchSiteStatistics({siteno, statType: 'median'}).then((stats) => {
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
