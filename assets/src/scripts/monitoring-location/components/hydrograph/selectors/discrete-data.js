import {createSelector} from 'reselect';

import {getIVCurrentVariableGroundwaterLevels} from 'ml/selectors/discrete-data-selector';
import {getRequestTimeRange} from 'ml/selectors/time-series-selector';

/*
 * Returns a selector function that returns the groundwater levels that will be visible
 * on the hydrograpnh
 * @return {Function} which returns an {Array} of groundwater level object with properties:
 *      @prop {Float} value
 *      @prop {Array of String} qualifiers
 *      @prop {Number} dateTime
 */
export const getVisibleGroundwaterLevelPoints = createSelector(
    getRequestTimeRange('current'),
    getIVCurrentVariableGroundwaterLevels,
    (timeRange, gwLevels) => {
        if (!timeRange || !gwLevels.values) {
            return [];
        }
        return gwLevels.values
            .filter((data) => {
                return data.dateTime > timeRange.start && data.dateTime < timeRange.end;
            })
            .map((data) => {
                return {
                    ...data,
                    value: parseFloat(data.value)
                };
            });
    }
);

/*
 * Returns a selector function that returns true if any ground water
 * levels are visible.
 * @return {Function} which returns {Boolean}
 */
export const anyVisibleGroundwaterLevels = createSelector(
    getVisibleGroundwaterLevelPoints,
    (gwLevels) => gwLevels.length !== 0
);