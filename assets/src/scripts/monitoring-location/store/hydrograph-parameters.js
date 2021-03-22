
import merge from 'lodash/merge';

import config from 'ui/config';

import {fetchGroundwaterLevels} from 'ui/web-services/groundwater-levels';
import {fetchTimeSeries} from 'ui/web-services/instantaneous-values';

import {getConvertedTemperatureParameter, hasMeasuredFahrenheitParameter} from 'ml/iv-data-utils';
import {Actions as floodStateActions} from './flood-inundation';

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
        let fetchPromises = [];
        if (config.ivPeriodOfRecord) {
            const fetchIVParameters = fetchTimeSeries({sites: [siteno]})
                .then(series => {
                    if (series.value && series.value.timeSeries) {
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
                            // If the parameter is for gage height set the initial flood gage height
                            if (parameterCode === config.GAGE_HEIGHT_PARAMETER_CODE) {
                                dispatch(floodStateActions.setGageHeight(parseFloat(ts.values[0].value[0].value)));
                            }

                            // If it is a celsius parameterCode, add a variable for calculated Fahrenheit.
                            if (config.TEMPERATURE_PARAMETERS.celsius.includes(parameterCode) &&
                                !hasMeasuredFahrenheitParameter(parameterCode, allParameterCodes)) {
                                const fahrenheitParameter = getConvertedTemperatureParameter(varsByPCode[parameterCode]);
                                varsByPCode[fahrenheitParameter.parameterCode] = fahrenheitParameter;
                            }
                            return varsByPCode;
                        }, {});
                    } else {
                        return null;
                    }
                })
                .catch(reason => {
                    console.error(reason);
                    throw reason;
                });
            fetchPromises.push(fetchIVParameters);
        }
        if (config.gwPeriodOfRecord) {
            const fetchGWLevelParameters = fetchGroundwaterLevels({siteno: siteno})
                .then(series => {
                    if (series.value && series.value.timeSeries) {
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
                    } else {
                        return null;
                    }
                })
                .catch(reason => {
                    console.error(reason);
                    throw reason;
                });
            fetchPromises.push(fetchGWLevelParameters);
        }
        if (fetchPromises.length) {
            return Promise.all(fetchPromises).then(([ivVars, gwVars]) => {
                const mergedVars = merge({}, gwVars, ivVars);
                dispatch(updateHydrographParameters(mergedVars));
            });
        } else {
            return Promise.resolve();
        }
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