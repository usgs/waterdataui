import {DateTime} from 'luxon';

import {fetchGroundwaterLevels} from 'ui/web-services/groundwater-levels';

const INITIAL_DATA = {
    groundwaterLevels : null
};

/*
 * Synchronous Redux actions to add the ground water level data for the variable.
 * @param {String} parameterCode -
 * @param {Object} data - Each object has properties
 *      @prop {Object} variable - contains detailed information about the parameter
 *      @prop {Array of Object} values - contains the following properties
 *        @prop {String} value
 *        @prop {Array of String} qualifiers
 *        @prop {Number} dateTime - Unix epoch time
 */
export const addGroundwaterLevels = function(variableID, data) {
    return {
        type: 'ADD_GROUNDWATER_LEVELS',
        variableID,
        data
    };
};

/*
 * Redux asynchronous action to retrieve the groundwater levels for a monitoring location and parameterCode
 * over the time period
 * @param {String} monitoringLocationId
 * @param {String} parameterCode
 * @param {String} startDT - ISO-8601 date format
 * @param {String} endDT - ISO-8601 date format
 */
export const retrieveGroundwaterLevels = function(monitoringLocationId, parameterCode, startDT, endDT) {
    return function(dispatch, getState) {
        const state = getState();
        if (state.discreteData.groundWaterLevels && parameterCode in state.discreteData.groundWaterLevels) {
            return Promise.resolve();
        }
        return fetchGroundwaterLevels({
            site: monitoringLocationId,
            parameterCode: parameterCode,
            startDT: startDT,
            endDT: endDT
        })
            .then(
                (data) => {
                    if (data.value && data.value.timeSeries && data.value.timeSeries.length) {
                        let values;
                        const timeSeries = data.value.timeSeries;
                        if (!timeSeries[0].values.length || !timeSeries[0].values[0].value.length) {
                            values = [];
                        } else {
                            values = timeSeries[0].values[0].value.map((v) => {
                                const dateTime = DateTime.fromISO(v.dateTime, {zone: 'utc'}).toMillis();
                                return {
                                    value: v.value,
                                    qualifiers: v.qualifiers,
                                    dateTime: dateTime
                                };

                            });
                        }
                        const variable = {
                            ...timeSeries[0].variable,
                            variableCode: timeSeries[0].variable.variableCode[0]
                        };
                        dispatch(addGroundwaterLevels(variable.oid, {
                            variable: variable,
                            values: values
                        }));
                    }
                },
                () => {
                    console.error(`Unable to retrieve ground water levels for site, 
                    ${monitoringLocationId} and parameterCode, ${parameterCode}`);
                });
    };
};

export const discreteDataReducer = function(discreteData = INITIAL_DATA, action) {
    switch(action.type) {
        case 'ADD_GROUNDWATER_LEVELS': {
            let newData = {};
            newData[action.variableID] = action.data;
            return Object.assign(
                {},
                discreteData,
                {
                    groundwaterLevels: Object.assign({}, discreteData.groundwaterLevels, newData)
                }
            );
        }
        default:
            return discreteData;
    }
};