
import merge from 'lodash/merge';

import config from 'ui/config';

import {fetchGroundwaterLevels} from 'ui/web-services/groundwater-levels';
import {fetchIVTimeSeries} from 'ui/web-services/instantaneous-values';
import {fetchSiteStatistics} from 'ui/web-services/statistics-data';

import {getConvertedTemperatureParameter} from 'ml/iv-data-utils';

/*
 * Synchronous Redux action - updatethe hydrograph variables
 * @param {Object} variables - keys are parameter codes.
 * @return {Object} - Redux action
 */
export const updateHydrographParameters = function(parameters) {
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
        const fetchIVParameters = fetchIVTimeSeries({sites: [siteno]}).then(series => {
            return series.value.timeSeries.reduce((varsByPCode, ts) => {
                const parameterCode = ts.variable.variableCode.value;
                varsByPCode[parameterCode] = {
                    parameterCode: parameterCode,
                    name: ts.variable.variableName,
                    description: ts.variable.variableDescription,
                    unit: ts.variable.unit.unitCode,
                    hasIVData: true,
                    ivMethods: ts.values.map(value => {
                        return {
                            description: value.method.methodDescription,
                            methodID: value.method.methodID
                        };
                    })
                };
                // If it is a celsius parameterCode, add a variable for calculated Fahrenheit.
                if (parameterCode in config.TEMPERATURE_PARAMETERS.celsius) {
                    const fahrenheitParameter = getConvertedTemperatureParameter(varsByPCode[parameterCode]);
                    varsByPCode[fahrenheitParameter.parameterCode] = fahrenheitParameter;
                }
            }, {});
        });
        const fetchGWLevelParameters = fetchGroundwaterLevels({site: siteno}).then(series => {
            return series.value.timeSeries.reduce((varsByPCode, ts) => {
                const parameterCode = ts.variable.variableCode.value;
                varsByPCode[parameterCode] = {
                    parameterCode: parameterCode,
                    name: ts.variable.variableName,
                    description: ts.variable.variableDescription,
                    unit: ts.variable.unit.unitCode,
                    hasGWLevelsData: true
                };
            }, {});
        });
        return Promise.all([fetchIVParameters, fetchGWLevelParameters]).then((ivVars, gwVars) => {
            const mergedVars = merge({}, gwVars, ivVars);
            dispatch(updateHydrographParameters(mergedVars));
        });
    };
};

export const hydrographVariablesReducer = function(hydrographParameters={}, action) {
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