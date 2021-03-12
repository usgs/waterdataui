
import {hasMeasuredFahrenheitParameter, isCalculatedTemperature, getConvertedTemperatureParameter
} from './iv-data-utils';

describe('monitoring-location/iv-data-utils', () => {

    describe('hasMeasuredFahrenheitParameter', () => {
        const allParameterCodes = ['72019', '00020', '00021', '00010', '45589'];

        it('Return false if the code does not have a fahrenheit counterpart', () => {
            expect(hasMeasuredFahrenheitParameter('72019', allParameterCodes)).toBe(false);
        });

        it('Return true if the measured fahrenheit parameter is in the list', () => {
            expect(hasMeasuredFahrenheitParameter('00020', allParameterCodes)).toBe(true);
        });

        it('Return false if the measured fahrenheit parameter is not in the list', () => {
            expect(hasMeasuredFahrenheitParameter('00010', allParameterCodes)).toBe(false);
            expect(hasMeasuredFahrenheitParameter('45589', allParameterCodes)).toBe(false);

        });
    });

    describe('isCalculatedTemperature', () => {
        it('Return true if this a calculated temperature parameter code', () => {
            expect(isCalculatedTemperature('00010F')).toBe(true);
        });

        it('Return false if this is not a calculated temperature parameter code', () => {
            expect(isCalculatedTemperature('00011')).toBe(false);
        });
    });

    describe('getConvertedTemperatureParameter', () => {
        it('Expects to convert the temperature parameter object to a calculated parameter object', () => {
           expect(getConvertedTemperatureParameter({
               parameterCode: '00010',
               name: 'Temperature, water, C',
               description: 'Temperature, water, degrees Celsius',
               unit: 'deg C',
               hasIVData: true
           })).toEqual({
               parameterCode: '00010F',
               name: 'Temperature, water, F (calculated)',
               description: 'Temperature, water, degrees Fahrenheit (calculated)',
               unit: 'deg F',
               hasIVData: true
           });
        });
    });
});
