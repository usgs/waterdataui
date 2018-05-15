const memoize = require('fast-memoize');
const find = require('lodash/find');
const reduce = require('lodash/reduce')
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

export const getCurrentVariableMedianStatPointsInDateRange = createSelector(
    getCurrentVariableMedianStatistics,
    getRequestTimeRange('current'),
    (stats, timeRange) => {
        if (!stats || !timeRange) {
            return {};
        }
        const startDate = new Date(timeRange.start).setFullYear(timeRange.start.getFullYear(), timeRange.start.getMonth(), timeRange.start.getDate());
        const endDate = new Date(timeRange.end).setFullYear(timeRange.end.getFullYear(), timeRange.end.getMonth(), timeRange.end.getDate());
        let nextDate = new Date(startDate);
        let datesOfInterest = [];
        while (nextDate <= endDate) {
            datesOfInterest.push({
                year: nextDate.getFullYear(),
                month: (nextDate.getMonth() + 1).toString(),
                day: nextDate.getDate().toString()
            });
            nextDate.setDate(nextDate.getDate() + 1);
        }
        datesOfInterest.push({
            year: nextDate.getFullYear(),
            month: (nextDate.getMonth() + 1).toString(),
            day: nextDate.getDate().toString()
        });
        return reduce(stats, function (result, tsData, tsId) {
            result[tsId] = datesOfInterest
                .map((date) => {
                    let stat = find(tsData, {'month_nu': date.month, 'day_nu': date.day});
                    return {
                        value: stat ? stat.p50_va: null,
                        date: new Date(parseInt(date.year), parseInt(date.month) - 1, parseInt(date.day))
                    };
                })
                .filter((point) => {
                    return point.value;
                });
            return result;
        }, {});
    }
);