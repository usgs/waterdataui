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
 *      @prop {String} class - a class that can be used to style this point
 *      @prop {String} label - a human readable label for this kind of point
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

/*
 * Returns a selector function that returns true if any ground water
 * levels are visible.
 * @return {Function} which returns {Boolean}
 */
export const anyVisibleGroundwaterLevels = createSelector(
    getGroundwaterLevelPoints,
    (gwLevels) => gwLevels.length !== 0
);