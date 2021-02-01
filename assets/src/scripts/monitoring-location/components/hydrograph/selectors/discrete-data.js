import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import {getIVCurrentVariableGroundwaterLevels} from 'ml/selectors/discrete-data-selector';
import {getRequestTimeRange, getCurrentVariable} from 'ml/selectors/time-series-selector';
import {getIanaTimeZone} from 'ml/selectors/time-zone-selector';

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
 * Selector function which returns a function that returns an array of gw data appropriate
 * for use in a table.
 * @return {Function} - Function returns an array of visible ground water values with properties:
 *      @prop {String} parameterName
 *      @prop {String} result
 *      @prop {String} dateTime in site's time zone.
 */
export const getVisibleGroundwaterLevelsTableData = createSelector(
    getCurrentVariable,
    getVisibleGroundwaterLevelPoints,
    getIanaTimeZone,
    (currentVariable, gwLevels, timeZone) => {
        return gwLevels.map((point) => {
            return {
                parameterName: currentVariable.variableName,
                result: point.value.toString(),
                dateTime: DateTime.fromMillis(point.dateTime, {zone: timeZone}).toISO({
                    suppressMilliseconds: true,
                    suppressSeconds: true
                })
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