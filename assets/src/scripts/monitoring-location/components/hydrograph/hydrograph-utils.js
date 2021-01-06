import cloneDeep from 'lodash/cloneDeep';

import config from 'ui/config';
import {convertCelsiusToFahrenheit} from 'ui/utils';

export const MAX_DIGITS_FOR_DAYS_FROM_TODAY = 5;

/*
* Helper function that determines if URL query parameter for time period is
* acceptable. The purpose here is to prevent users from altering the URL in a way that
* is undesirable or impossible for the application to process. We will accept
* time periods in the form of P{MAX_DIGITS_FOR_DAYS_FROM_TODAY}D, or P1Y
* @param {String} periodCode the time period code from the timespan radio buttons
* @return {Boolean} if the value is within acceptable limits
* */
export const isPeriodWithinAcceptableRange = function(periodCode) {

    return periodCode &&
        periodCode.charAt(0) === 'P' &&
        periodCode.slice(-1) === 'D' &&
        periodCode.slice(1,-1).length < MAX_DIGITS_FOR_DAYS_FROM_TODAY ||
        periodCode === 'P1Y';
};


/*
* Helper function that sorts between 'custom' (user defined)  and the default time period options
* @param {String} periodCode the time period code from the timespan radio buttons
* @return {Boolean} if the value is or is not a 'custom' (user defined) time period
* */
export const isPeriodCustom = function(periodCode) {

    return periodCode !== 'P7D' &&
        periodCode !== 'P30D' &&
        periodCode !== 'P1Y';
};


/*
* Helper function that sorts between 'custom' (user defined)  and the default time period options
* There are two general categories of user selected time periods (noted as 'period' in the code) for display on the hydrograph.
* The first category contains time periods that are pre-defined in the application like 7 days, 30 days, and one year.
* The second category are 'custom' time periods defined by the user through use of a calender date picker or days in an input field.
* The 'period' information is passed in the URL as a parameter (such as &period=P1D). In the following line the period is
* parsed into a 'custom' (or not) category and then parts are used to set the checked radio buttons and form fields as needed
* @param {String} the time period code from the timespan radio buttons
* @return {Object} parsed period code values
* */
export const parsePeriodCode = function(periodCode) {
    if (periodCode) {
        const mainTimeRangeSelectionButton = isPeriodCustom(periodCode) ? 'custom' : periodCode;
        const userInputNumberOfDays = mainTimeRangeSelectionButton === 'custom' ? periodCode.slice(1,-1) : '';

        return {
            'mainTimeRangeSelectionButton' : mainTimeRangeSelectionButton,
            'numberOfDaysFieldValue': userInputNumberOfDays
        };
    } else {

        return {
            'mainTimeRangeSelectionButton' : 'P7D',
            'numberOfDaysFieldValue': ''
        };
    }
};

/*
 * Converts a celsius time series to fahrenheit and store in collection.
 * @param {Object} time series collection
 * @returns {Object} time series collection with fahrenheit version added
 */
export const convertTemperatureSeriesAndAddToCollection = function(collection) {
    Object.entries(collection.timeSeries).forEach((currentInLoopSeries) => {
        const currentInLoopVariableCode = currentInLoopSeries[1].variable;
        const currentInLoopParameterCode = collection.variables[currentInLoopVariableCode].variableCode.value;

        if (config.CELSIUS_TEMPERATURE_PARAMETERS.includes(currentInLoopParameterCode)) {
            const convertedTimeSeries = cloneDeep(currentInLoopSeries);
            const points = currentInLoopSeries[1].points;
            const convertedTemperaturePoints = cloneDeep(points);
            let calculatedNWISVariable = cloneDeep(collection.variables[currentInLoopVariableCode]);

            calculatedNWISVariable.variableName = calculatedNWISVariable.variableName.replace('C', 'F (calculated)');
            calculatedNWISVariable.variableDescription = calculatedNWISVariable.variableDescription.replace('Celsius', 'Fahrenheit (calculated)');
            calculatedNWISVariable.unit.unitCode = calculatedNWISVariable.unit.unitCode.replace('C', 'F');
            calculatedNWISVariable.variableCode.value = `${calculatedNWISVariable.variableCode.value}${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`;
            calculatedNWISVariable.oid = `${calculatedNWISVariable.oid}_${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`;

            convertedTemperaturePoints.forEach(convertedTemperaturePoint => {
                convertedTemperaturePoint.value = convertCelsiusToFahrenheit(convertedTemperaturePoint.value);
            });
            convertedTimeSeries[0] = `${convertedTimeSeries[0].split(':')[0]}_${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}:${convertedTimeSeries[0].split(':')[1]}:${convertedTimeSeries[0].split(':')[2]}`;
            convertedTimeSeries[1].points = convertedTemperaturePoints;
            convertedTimeSeries[1].variable =
                `${convertedTimeSeries[1].variable}_${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`;
            collection.timeSeries[convertedTimeSeries[0]] = convertedTimeSeries[1];
            collection.variables[`${currentInLoopVariableCode}_${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`] = calculatedNWISVariable;
        }
    });
    return collection;
};
