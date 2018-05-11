const merge = require('lodash/merge');

/* Case reducers */
const addStatsCollection = function(statisticsData, action) {
    return merge({}, statisticsData, action.data);
};

export const statisticsDataReducer = function(statisticsData={}, action) {
    switch(action.type) {
        case 'STATS_COLLECTION_ADD': return addStatsCollection(statisticsData, action);
        default: return statisticsData;
    }
};
