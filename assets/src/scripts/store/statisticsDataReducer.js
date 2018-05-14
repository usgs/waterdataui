const merge = require('lodash/merge');

const INITIAL_STATE = {
    median: {}
};

/* Case reducers */
const addMedianStats = function(statisticsData, action) {
    //TODO: Make sure stats are sorted in store.js
    return {
        ...statisticsData,
        median: merge({}, statisticsData.median, action.data)
    };
};

export const statisticsDataReducer = function(statisticsData=INITIAL_STATE, action) {
    switch(action.type) {
        case 'MEDIAN_STATS_ADD': return addMedianStats(statisticsData, action);
        default: return statisticsData;
    }
};
