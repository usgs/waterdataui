import {createSelector} from 'reselect';

import {getCurrentParmCd} from './time-series-selector';

/*
 * Returns selector function which returns all of the groundwater levels.
 * @return {Function} - The function returns an Object containing all of the groundwater levels. The
 * object's keys represent parameter codes.
 */
export const getAllGroundwaterLevels =
    (state) => state.discreteData.groundwaterLevels ? state.discreteData.groundwaterLevels : null;

/*
 * Returns selector function which returns the groundwater levels for the current IV variable
 * @return {Function} - The function returns an Object with the following properties:
 *      @prop {Object} variable
 *      @prop {Object} values
 */
export const getIVCurrentVariableGroundwaterLevels = createSelector(
    getAllGroundwaterLevels,
    getCurrentParmCd,
    (gwLevels, parameterCode) => {
        return gwLevels && parameterCode && gwLevels[parameterCode] ? gwLevels[parameterCode] : {};
    }
);
