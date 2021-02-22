
import merge from 'lodash/merge';

import config from 'ui/config';

import {fetchGroundwaterLevels} from 'ui/web-services/groundwater-levels';
import {fetchTimeSeries} from 'ui/web-services/instantaneous-values';

import {getConvertedTemperatureParameter, hasMeasuredFahrenheitParameter} from 'ml/iv-data-utils';

/*
 * Synchronous Redux action - updatethe hydrograph variables
 * @param {Object} variables - keys are parameter codes.
 * @return {Object} - Redux action
 */
const updateHydrographParameters = function(parameters) {
    return {
        type: 'UPDATE_HYDROGRAPH_PARAMETERS',
        parameters
    };
};

/*
 * Asynchronous Redux action - fetches the latest value for all parameter codes and
 * updates the store hydrograph parameter codes.
 */
export const retrieveHydrographParameters = function(siteno) {
    return function(dispatch) {
        const fetchIVParameters = fetchTimeSeries({sites: [siteno]}).then(series => {
            const allParameterCodes = series.value.timeSeries.map(ts => ts.variable.variableCode[0].value);
            return series.value.timeSeries.reduce((varsByPCode, ts) => {
                const parameterCode = ts.variable.variableCode[0].value;
                varsByPCode[parameterCode] = {
                    parameterCode: parameterCode,
                    name: ts.variable.variableName,
                    description: ts.variable.variableDescription,
                    unit: ts.variable.unit.unitCode,
                    hasIVData: true
                };
                // If it is a celsius parameterCode, add a variable for calculated Fahrenheit.
                if (config.TEMPERATURE_PARAMETERS.celsius.includes(parameterCode) &&
                    !hasMeasuredFahrenheitParameter(parameterCode, allParameterCodes)) {
                    const fahrenheitParameter = getConvertedTemperatureParameter(varsByPCode[parameterCode]);
                    varsByPCode[fahrenheitParameter.parameterCode] = fahrenheitParameter;
                }
                return varsByPCode;
            }, {});
        });
        const fetchGWLevelParameters = fetchGroundwaterLevels({site: siteno}).then(series => {
            return series.value.timeSeries.reduce((varsByPCode, ts) => {
                const parameterCode = ts.variable.variableCode[0].value;
                varsByPCode[parameterCode] = {
                    parameterCode: parameterCode,
                    name: ts.variable.variableName,
                    description: ts.variable.variableDescription,
                    unit: ts.variable.unit.unitCode,
                    hasGWLevelsData: true
                };
                return varsByPCode;
            }, {});
        });
        return Promise.all([fetchIVParameters, fetchGWLevelParameters]).then(([ivVars, gwVars]) => {
            const mergedVars = merge({}, gwVars, ivVars);
            dispatch(updateHydrographParameters(mergedVars));
        });
    };
};

export const hydrographParametersReducer = function(hydrographParameters={}, action) {
    switch(action.type) {
        case 'UPDATE_HYDROGRAPH_PARAMETERS': {
            return {
                ...action.parameters
            };
        }
        default:
            return hydrographParameters;
    }
};