import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import config from 'ui/config';

import {convertCelsiusToFahrenheit} from 'ui/utils';

/*
* Converts a Celsius 'variable' from the NWIS system to one we can use to show Fahrenheit.
* @param {Object} NWISVariable - Has various properties related to descriptions of data
* @return {Object} NWIS variable converted for use with Fahrenheit
 */
const createConvertedVariable = function(NWISVariable) {
    NWISVariable.variableName = NWISVariable.variableName.replace('C', 'F (calculated)');
    NWISVariable.variableDescription = NWISVariable.variableDescription.replace('Celsius', 'Fahrenheit (calculated)');
    NWISVariable.unit.unitCode = NWISVariable.unit.unitCode.replace('C', 'F');
    NWISVariable.variableCode.value = `${NWISVariable.variableCode.value}${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`;
    NWISVariable.variableCode.variableID = `${NWISVariable.variableCode.variableID}${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`;
    NWISVariable.oid = `${NWISVariable.oid}${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`;

    return  {
        [NWISVariable.oid]: NWISVariable
    };
};

/*
* Converts the temperature values (points) in the cloned time series from Celsius to Fahrenheit
* @param {Object} timeSeries - a time series with Celsius data values
* @param {Object} tsRequestKey - the time series request key
* @param (Object} parameterCode - parameter code (should always be a Celsius code)
* @return {Object} A time series with points converted from Celsius to Fahrenheit
*   important properties (there are many others)
*   @prop - {Object) points - An object containing temperature data
*   @prop - {String} variable - The 'variable' from the NWIS system, will have a suffix indicating a converted value
 */
const createConvertedTimeSeries = function(timeSeries, tsRequestKey, parameterCode) {
    timeSeries.points.forEach(temperaturePoint => {
        temperaturePoint.value = convertCelsiusToFahrenheit(temperaturePoint.value);
    });

    timeSeries.variable = `${timeSeries.variable}${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`;
    const tsRequestKeyValue = `${timeSeries.tsKey}:${parameterCode}${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`;

    return {
        [`${timeSeries.method}:${tsRequestKeyValue}`]: timeSeries
    };
};

/*
* Takes a time series collection checks if there are any Celsius parameter codes and calls other methods to convert
* that series to a new object which is then added to the application state.
* @param {Object} collection - complex object built with information retrieved from NWIS - contains information about
* all data that appears in the hydrograph
 */
export const convertCelsiusCollectionsToFahrenheitAndMerge = function(collection) {
    Object.entries(collection.timeSeries).forEach((timeSeries) => {
        const tsRequestKey = timeSeries[0];
        const timeSeriesDetails = timeSeries[1];
        const variableCode = timeSeriesDetails.variable;
        // Cross reference the 'variableCode' in the 'timeSeries' with 'variables' in the state
        // to get the corresponding parameter code
        const parameterCode = collection.variables[variableCode].variableCode.value;
        // For any Celsius parameter codes, clone the application state variables, 'variables and timeSeries'
        // and convert the appropriate properties to Fahrenheit. Then add the cloned objects to the 'collection'
        if (config.TEMPERATURE_PARAMETERS.celsius.includes(parameterCode)) {
            merge(collection.variables,
                createConvertedVariable(cloneDeep(collection.variables[variableCode])));
            merge(collection.timeSeries,
                createConvertedTimeSeries(cloneDeep(collection.timeSeries[tsRequestKey]), tsRequestKey, parameterCode));
        }
    });
};