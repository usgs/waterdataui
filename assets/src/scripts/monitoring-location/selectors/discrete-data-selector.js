import {createSelector} from 'reselect';

import {getCurrentVariableID} from './time-series-selector';

/*
 * Returns selector function which returns all of the groundwater levels.
 * @return {Function} - The function returns an Object containing all of the groundwater levels. The
 * object's keys represent parameter codes.
 */
export const getAllGroundwaterLevels =
    (state) => state.discreteData.groundwaterLevels ? state.discreteData.groundwaterLevels : null;

/*
 * Returns a selector function which returns an array of all variables that have
 * groundwater levels
 * @return {Function} The Function returns an array of the variable properties for each variable
 * in groundwaterLevels.
 */
export const getAllGroundwaterLevelVariables = createSelector(
    getAllGroundwaterLevels,
    (gwLevels) => {
        return gwLevels ? Object.values(gwLevels).map(level => level.variable) : [];
    }
);

/*
 * Returns selector function which returns the groundwater levels for the current IV variable
 * @return {Function} - The function returns an Object with the following properties:
 *      @prop {Object} variable
 *      @prop {Object} values
 */
export const getIVCurrentVariableGroundwaterLevels = createSelector(
    getAllGroundwaterLevels,
    getCurrentVariableID,
    (gwLevels, variableID) => {
        return gwLevels && variableID && gwLevels[variableID] ? gwLevels[variableID] : {};
    }
);
