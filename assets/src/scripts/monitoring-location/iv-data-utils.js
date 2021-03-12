
import config from 'ui/config';

/*
* Avoids having two Fahrenheit parameters for monitoring locations that already have both a measured Celsius and
* Fahrenheit value for corresponding data parameters.
*  Below is a listing of the known codes and counterparts
* '00020': '00021' - air temperature C:F
* '00010': '00011' - water temperature C:F
* '45589': '45590' - Temperature, internal, within equipment shelter C:F
* @param {String} parameterCode - five  digit USGS identifier for data sampled at monitoring location
* @param {Array of String} - allParameterCodes
* @return {Boolean} - isParameterMatching, true if current parameter code matches a corresponding code for
* Fahrenheit in the application state, false if it does not.
 */
export const hasMeasuredFahrenheitParameter = function(parameterCode, allParameterCodes) {
    let isParameterMatching;
    switch(parameterCode) {
        case '00020':
            isParameterMatching = allParameterCodes.includes('00021');
            break;
        case '00010':
            isParameterMatching = allParameterCodes.includes('00011');
            break;
        case '45589':
            isParameterMatching = allParameterCodes.includes('45590');
            break;
        default:
            isParameterMatching = false;
    }

    return isParameterMatching;
};

/*
 * Return true if this parameter code represents one that is calculated
 * @param {String} parameterCode
 * @return {Boolean}
 */
export const isCalculatedTemperature = function(parameterCode) {
    return parameterCode.slice(-1) === config.CALCULATED_TEMPERATURE_VARIABLE_CODE;
};

/*
 * Converts the parameter object for a celsius parameter to one that represents calculated Fahrenheit.
 * @param {Object} parameter
 * @return {Object} converted parameter
 */
export const getConvertedTemperatureParameter = function(parameter) {
    return {
        ...parameter,
        parameterCode: `${parameter.parameterCode}${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`,
        name: parameter.name.replace('C', 'F (calculated)'),
        description: parameter.description.replace('Celsius', 'Fahrenheit (calculated)'),
        unit: parameter.unit.replace('C', 'F')
    };
};
