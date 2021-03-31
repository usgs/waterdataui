import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import config from 'ui/config';

import {getGroundwaterLevels, getPrimaryParameter} from 'ml/selectors/hydrograph-data-selector';

const GW_LEVEL_RADIUS = 7;
const GW_LEVEL_CLASS = 'gw-level-point';

const APPROVAL_QUALIFIERS = {
    'A': {label: 'Approved', class: 'approved'},
    'P': {label: 'Provisional', class: 'provisional'},
    'R': {label: 'Revised', class: 'revised'}
};

const getDetailsForApprovalCode = function(qualifiers) {
    const approvalQualifier = qualifiers.find(qualifier => qualifier in APPROVAL_QUALIFIERS);
    if (approvalQualifier) {
        return APPROVAL_QUALIFIERS[approvalQualifier];
    } else {
        return APPROVAL_QUALIFIERS['P'];
    }
};

/*
 * Returns a selector function that returns the groundwater levels that will be visible
 * on the hydrograph
 * @return {Function} which returns an {Array} of groundwater level object with properties:
 *      @prop {Float} value
 *      @prop {Number} dateTime
 *      @prop {Array of String} classes - a class that can be used to style this point
 *      @prop {String} label - a human readable label for this kind of point
 *      @prop {Number} radius - used to draw the circle marker
 */
export const getGroundwaterLevelPoints = createSelector(
    getGroundwaterLevels,
    gwLevels => {
        if (!gwLevels) {
            return [];
        }
        return gwLevels.values.map(data => {
            const approvalDetails = getDetailsForApprovalCode(data.qualifiers);
            return {
                value: data.value,
                dateTime: data.dateTime,
                classes: [GW_LEVEL_CLASS, approvalDetails.class],
                label: approvalDetails.label,
                radius: GW_LEVEL_RADIUS
            };
        });
    }
);

/*
 * Returns a selector function which returns a two element Array for the
 * value range for the groundwater levels.
 * @return {Function} return an {Array of Number} - [min, max]
 */
export const getGroundwaterLevelDataRange = createSelector(
    getGroundwaterLevelPoints,
    points => {
        if (!points) {
            return null;
        }

        const values = points.filter(data => data.value !== null).map(data => data.value);
        if (values.length) {
            return [Math.min(...values), Math.max(...values)];
        } else {
            return null;
        }
    }
);

/*
 * Returns a selector function which returns the unique classes/label/radius for the gw level points
 * @return {Function} which returns an {Array of Object} with the following properties:
 *      @prop {Array of String} classes
 *      @prop {String} label
 *      @prop {Number} radius
 */
export const getUniqueGWKinds = createSelector(
    getGroundwaterLevelPoints,
    gwPoints => {
        const allKinds = gwPoints.map(point => {
            return {
                classes: point.classes,
                label: point.label,
                radius: point.radius
            };
        });
        return uniqWith(allKinds, isEqual);
    }
);

/*
 * Selector function which returns a function that returns an array of gw data appropriate
 * for use in a table.
 * @return {Function} - Function returns an array of visible ground water values with properties:
 *      @prop {String} parameterName
 *      @prop {String} result
 *      @prop {String} dateTime in site's time zone.
 *      @prop {String} approvals
 */
export const getGroundwaterLevelsTableData = createSelector(
    getPrimaryParameter,
    getGroundwaterLevelPoints,
    (parameter, gwLevels) => {
        if (!parameter || !gwLevels) {
            return [];
        }
        return gwLevels.map((point) => {
            return {
                parameterName: parameter.name,
                result: point.value.toString(),
                dateTime: DateTime.fromMillis(point.dateTime, {zone: config.locationTimeZone}).toISO({
                    suppressMilliseconds: true,
                    suppressSeconds: true
                }),
                approvals: point.label
            };
        });
    }
);
