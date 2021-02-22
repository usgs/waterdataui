
import memoize from 'fast-memoize';
import find from 'lodash/find';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import config from 'ui/config';

export const getTimeRange = memoize((timeRangeKind) => state => state.hydrographData[`${timeRangeKind}TimeRange`] || null);

export const getIVData = memoize((dataKind) => state => state.hydrographData[`${dataKind}IVData`]) || null;

export const getMedianStatisticsData = state => state.hydrographData.medianStatisticsData || null;

export const getGroundwaterLevels = state => state.hydrographData.groundwaterLevels ||  null;

export const getIVValueRange = memoize(dataKind => createSelector(
    getIVData(dataKind),
    ivData => {
        if (!ivData) {
            return null;
        }

        let values = [];
        Object.values(ivData.values).forEach(byMethodID => {
            values.push(...byMethodID.points.filter(point => point.value !== null).map(point => point.value));
        });
        if (values.length) {
            return [Math.min(...values), Math.max(...values)];
        } else {
            return null;
        }
    }
));

export const getGroundwaterLevelsValueRange = createSelector(
    getGroundwaterLevels,
    gwLevels => {
        if (!gwLevels) {
            return null;
        }

        const values = gwLevels.values.filter(data => data.value !== null).map(data => data.value);
        if (values.length) {
            return [Math.min(...values), Math.max(...values)];
        }
    }
);

export const getPrimaryParameter = createSelector(
    getIVData('primary'),
    getGroundwaterLevels,
    (ivData, gwLevels) => {
        let parameter = null;
        if (ivData) {
            parameter = ivData.parameter;
        } else if (gwLevels) {
            parameter = gwLevels.parameter;
        }
        return parameter;
    }
);

export const getPrimaryMethods = createSelector(
    getIVData('primary'),
    ivData => {
        if (!ivData) {
            return [];
        }
        return Object.values(ivData.values).map(value => value.method);
    }
);

/*
 * @return {Function} which returns an Object with keys by tsId. Each property
 * is an {Object} as follows:
 * @prop {Array of Object} values - where each object has point, dateTime keys
 * @prop {String} description - statistic description
 * the value at local time for the month/day in the original statistics data
 */
export const getPrimaryMedianStatisticsData = createSelector(
    getTimeRange('current'),
    getMedianStatisticsData,
    (timeRange, stats) => {
        if (!stats || !timeRange) {
            return null;
        }

        let result = {};
        Object.values(stats).forEach(statsForTsId => {
            const tsID = statsForTsId[0].ts_id;
            result[tsID] = {
                values: [],
                description: statsForTsId[0].loc_web_ds,
                beginYear: statsForTsId[0].begin_yr,
                endYear: statsForTsId[0].end_yr
            };
            let currentDateTime = DateTime.fromMillis(timeRange.start, {zone: config.locationTimeZone});

            while (currentDateTime < timeRange.end) {
                const thisStatsData = find(statsForTsId, (stat) => {
                    return stat.month_nu === currentDateTime.month && stat.day_nu === currentDateTime.day;
                });
                if (thisStatsData) {
                    result[tsID].values.push({
                        point: thisStatsData.p50_va,
                        dateTime: currentDateTime.toMillis()
                    });
                }
                currentDateTime = currentDateTime.plus({days: 1}).startOf('day');
            }
            result[tsID].values.push({
                point: result[tsID].values[result[tsID].values.length - 1].point,
                dateTime: timeRange.end
            });
        });
        return result;
    }
);

export const getPrimaryMedianStatisticsValueRange = createSelector(
    getPrimaryMedianStatisticsData,
    statsData => {
        if (!statsData) {
            return null;
        }

        let values = [];
        Object.values(statsData).forEach(byTsID => {
            values.push(...byTsID.values.map(value => value.point));
        });
        if (values.length) {
            return [Math.min(...values), Math.max(...values)];
        } else {
            return null;
        }
    }
);