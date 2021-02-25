import config from 'ui/config';

import {getAvailableParameters} from './parameter-data';

describe('monitoring-location/components/hydrograph/selectors/parameter-data', () => {
    config.ivPeriodOfRecord = {
        '00060': {
            begin_date: '1980-01-01',
            end_date: '2020-01-01'
        },
        '72019': {
            begin_date: '1980-04-01',
            end_date: '2020-04-01'
        },
        '00010': {
            begin_date: '1981-04-01',
            end_date: '2019-04-01'
        }

    };
    config.gwPeriodOfRecord = {
        '72019': {
            begin_date: '1980-03-31',
            end_date: '2020-03-31'
        },
        '62610': {
            begin_date: '1980-05-01',
            end_date: '2020-05-01'
        }
    };

    const TEST_PARAMETERS = {
        '00060': {
            parameterCode: '00060',
            name: 'Streamflow, ft3/s',
            description: 'Discharge, cubic feet per second',
            unit: 'ft3/s',
            hasIVData: true
        },
        '00010': {
            parameterCode: '00010',
            name: 'Temperature, water, C',
            description: 'Temperature, water, degrees Celsius',
            unit: 'deg C',
            hasIVData: true
        },
        '00010F': {
            parameterCode: '00010F',
            name: 'Temperature, water, F',
            description: 'Temperature, water, degrees Fahrenheit',
            unit: 'deg F',
            hasIVData: true
        },
        '72019': {
            parameterCode: '72019',
            name: 'Depth to water level, ft below land surface',
            description: 'Depth to water level, feet below land surface',
            unit: 'ft',
            hasIVData: true,
            hasGWLevelsData: true
        },
        '62610': {
            parameterCode: '62610',
            name: 'Groundwater level above NGVD 1929, feet',
            description: 'Groundwater level above NGVD 1929, feet',
            unit: 'ft',
            hasGWLevelsData: true
        }
    };

    describe('getAvailableParameters', () => {
        it('Return an empty array if no variables for IV or discrete data groundwater levels are defined', () => {
            expect(getAvailableParameters({
                hydrographParameters: {}
            })).toHaveLength(0);
        });

        it('Expects sorted array of parameter codes', () => {
            const parameters = getAvailableParameters({
                hydrographParameters: TEST_PARAMETERS
            });
            expect(parameters).toHaveLength(5);
            expect(parameters[0].parameterCode).toEqual('00060');
            expect(parameters[0].description).toEqual('Discharge, cubic feet per second');
            expect(parameters[0].periodOfRecord).toEqual({
                begin_date: '1980-01-01',
                end_date: '2020-01-01'
            });
            expect(parameters[0].waterAlert.hasWaterAlert).toBe(true);
            expect(parameters[0].waterAlert.subscriptionParameterCode).toEqual('00060');

            expect(parameters[1].parameterCode).toEqual('72019');
            expect(parameters[1].description).toEqual('Depth to water level, feet below land surface');
            expect(parameters[1].periodOfRecord).toEqual({
                begin_date: '1980-03-31',
                end_date: '2020-04-01'
            });
            expect(parameters[1].waterAlert.hasWaterAlert).toBe(true);
            expect(parameters[1].waterAlert.subscriptionParameterCode).toEqual('72019');

            expect(parameters[2].parameterCode).toEqual('62610');
            expect(parameters[2].periodOfRecord).toEqual({
                begin_date: '1980-05-01',
                end_date: '2020-05-01'
            });
            expect(parameters[2].waterAlert.hasWaterAlert).toBe(false);

            expect(parameters[3].parameterCode).toEqual('00010');

            expect(parameters[4].parameterCode).toEqual('00010F');
            expect(parameters[4].periodOfRecord).toEqual({
                begin_date: '1981-04-01',
                end_date: '2019-04-01'
            });
            expect(parameters[4].waterAlert.hasWaterAlert).toBe(true);
            expect(parameters[4].waterAlert.subscriptionParameterCode).toEqual('00010');
        });
    });
});