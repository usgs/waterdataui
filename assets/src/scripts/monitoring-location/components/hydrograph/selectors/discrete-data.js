import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import config from 'ui/config';

import {getGroundwaterLevels} from 'ml/selectors/hydrograph-data-selector';

/*
 * Returns a selector function that returns the groundwater levels that will be visible
 * on the hydrograpnh
 * @return {Function} which returns an {Array} of groundwater level object with properties:
 *      @prop {Float} value
 *      @prop {Array of String} qualifiers
 *      @prop {Number} dateTime
 */
export const getGroundwaterLevelPoints = createSelector(
    getGroundwaterLevels,
    gwLevels => {
        if (!gwLevels) {
            return [];
        }
        return gwLevels.values.map(data => {
            return {
                value: data.value,
                dateTime: data.dateTime
            };
        });
    }
);

/*
* When given an approval code, will return the text equivalent
*  @param {String} approvalCode - Usually a letter such as 'A'
*   @return {String} - an easy to understand text version of an approval code
*/
const approvalCodeText = function(approvalCode) {
    const approvalText = {
        P: 'Provisional',
        A: 'Approved',
        R: 'Revised',
        default: `unknown code: ${approvalCode}`
    };

    return approvalText[approvalCode] || approvalText.default;
};

/*
 * Selector function which returns a function that returns an array of gw data appropriate
 * for use in a table.
 * @return {Function} - Function returns an array of visible ground water values with properties:
 *      @prop {String} parameterName
 *      @prop {String} result
 *      @prop {String} dateTime in site's time zone.
 */
export const getGroundwaterLevelsTableData = createSelector(
    getGroundwaterLevels,
    gwLevels => {
        if (!gwLevels) {
            return [];
        }
        return gwLevels.values.map((point) => {
            return {
                parameterName: gwLevels.parameter.name,
                result: point.value.toString(),
                dateTime: DateTime.fromMillis(point.dateTime, {zone: config.locationTimeZone}).toISO({
                    suppressMilliseconds: true,
                    suppressSeconds: true
                }),
                approvals: approvalCodeText(point.qualifiers[0])
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
    getGroundwaterLevelPoints,
    (gwLevels) => gwLevels.length !== 0
);