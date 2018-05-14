const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { getCurrentParmCd, getRequestTimeRange } = require('./timeSeriesSelector');

/*
 * Selectors that return properties from the state
 */
export const getMedianStatistics = state => state.statisticsData.median || {};

/*
 * Selectors that return derived data
 */
export const getMedianStatisticsByParmCd = memoize(parmCd => createSelector(
    getMedianStatistics,
    stats => stats[parmCd] || null
));

export const getCurrentVariableMedianStatistics = createSelector(
    getCurrentParmCd,
    getMedianStatistics,
    (parmCd, stats) => stats[parmCd] || null
);

//TODO: worry about timezone later after Andrew's changes.
export const getCurrentVariableMedianStatisticsInDateRange = createSelector(
    getCurrentVariableMedianStatistics,
    getRequestTimeRange('current'),
    (stats, timeRange) => {
        const start = {
            month: timeRange.start.getMonth(),
            day: timeRange.start.getDate()
        };
        const end = {
            month: timeRange.end.getMonth(),
            day: timeRange.end.getDate()
        };

        return stats.filter((stat) => {
            return stat.month_nu >= start.month && stat.day_nu >= start.day &&
                stat.month_nu <= end.month && stat.day_nu <= end.day;
        });
    }
);