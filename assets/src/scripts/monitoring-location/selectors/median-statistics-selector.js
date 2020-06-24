
import memoize from 'fast-memoize';
import reduce from 'lodash/reduce';
import {createSelector} from 'reselect';

import {getCurrentParmCd} from './time-series-selector';

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

/*
 * @return {Object} where keys are TsID and the properties are the median data.
 */
export const getCurrentVariableMedianStatistics = createSelector(
    getCurrentParmCd,
    getMedianStatistics,
    (parmCd, stats) => stats[parmCd] || null
);

/*
 * @return {Object} where the key is tsID and properties are meta data for that tsId
 */
export const getCurrentVariableMedianMetadata = createSelector(
    getCurrentVariableMedianStatistics,
    (stats) => {
        return reduce(stats, (result, tsData, tsId) => {
            result[tsId] = {
                beginYear: tsData[0].begin_yr,
                endYear: tsData[0].end_yr,
                methodDescription: tsData[0].loc_web_ds
            };
            return result;
        }, {});
    }
);
