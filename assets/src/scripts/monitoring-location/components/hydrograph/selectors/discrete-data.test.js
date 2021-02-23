import config from 'ui/config';

import {getGroundwaterLevelPoints, getGroundwaterLevelsTableData,
    anyVisibleGroundwaterLevels} from './discrete-data';

describe('monitoring-location/components/hydrograph/selectors/discrete-data', () => {
    config.locationTimeZone = 'America/Chicago';

    const TEST_GW_LEVELS = {
        parameter: {
            parameterCode: '72019',
            name: 'Depth to water level'
        },
        values: [
            {value: 27.2, qualifiers: ['P'], dateTime: 1584648660000},
            {value: 26.9, qualifiers: ['A'], dateTime: 1589388420000},
            {value: 26.1, qualifiers: ['A'], dateTime: 1595522700000},
            {value: 26.5, qualifiers: ['R'], dateTime: 1598303040000}
        ]
    };
    const TEST_STATE = {
        hydrographData: {
            groundwaterLevels: TEST_GW_LEVELS
        }
    };

    describe('getGroundwaterLevelPoints', () => {
        it('Return empty array if no groundwater levels are defined', () => {
            expect(getGroundwaterLevelPoints({
                hydrographData: {}
            })).toHaveLength(0);
        });

        it('Return the ground water points when groundwater levels are defined', () => {
            const points = getGroundwaterLevelPoints(TEST_STATE);
            expect(points.length).toBe(4);
            expect(points[0]).toEqual({
                value: 27.2,
                dateTime: 1584648660000
            });
            expect(points[1]).toEqual({
                value: 26.9,
                dateTime: 1589388420000
            });
            expect(points[2]).toEqual({
                value: 26.1,
                dateTime: 1595522700000
            });
            expect(points[3]).toEqual({
                value: 26.5,
                dateTime: 1598303040000
            });
        });
    });

    describe('getGroundwaterLevelsTableData', () => {
        it('Returns an empty array if no groundwater levels', () => {
            expect(getGroundwaterLevelsTableData({
                hydrographData: {}
            })).toHaveLength(0);
        });

        it('Returns the array of groundwater levels table data', () => {
            const tableData = getGroundwaterLevelsTableData(TEST_STATE);
            expect(tableData).toHaveLength(4);
            expect(tableData[0]).toEqual({
                parameterName: 'Depth to water level',
                result: '27.2',
                dateTime: '2020-03-19T15:11-05:00',
                approvals: 'Provisional'
            });
            expect(tableData[1]).toEqual({
                parameterName: 'Depth to water level',
                result: '26.9',
                dateTime: '2020-05-13T11:47-05:00',
                approvals: 'Approved'
            });
            expect(tableData[2]).toEqual({
                parameterName: 'Depth to water level',
                result: '26.1',
                dateTime: '2020-07-23T11:45-05:00',
                approvals: 'Approved'
            });
            expect(tableData[3]).toEqual({
                parameterName: 'Depth to water level',
                result: '26.5',
                dateTime: '2020-08-24T16:04-05:00',
                approvals: 'Revised'
            });
        });
    });

    describe('anyVisibleGroundwaterLevels', () => {
        it('Return false if no visible ground water levels', () => {
            expect(anyVisibleGroundwaterLevels({
                hydrographData: {}
            })).toBe(false);
        });

        it('Return true if visible ground water levels', () => {
            expect(anyVisibleGroundwaterLevels(TEST_STATE)).toBe(true);
        });
    });
});
