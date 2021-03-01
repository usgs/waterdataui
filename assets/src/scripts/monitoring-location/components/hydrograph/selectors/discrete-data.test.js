import config from 'ui/config';

import {getGroundwaterLevelPoints, getUniqueGWKinds, getGroundwaterLevelsTableData,
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
            expect(points[0].value).toEqual(27.2);
            expect(points[0].dateTime).toEqual(1584648660000);
            expect(points[0].classes).toContain('provisional');
            expect(points[0].label).toEqual('Provisional');
            expect(points[0].radius).toBeDefined();

            expect(points[1].value).toEqual(26.9);
            expect(points[1].dateTime).toEqual(1589388420000);
            expect(points[1].classes).toContain('approved');
            expect(points[1].label).toEqual('Approved');
            expect(points[1].radius).toBeDefined();

            expect(points[2].value).toEqual(26.1);
            expect(points[2].dateTime).toEqual(1595522700000);
            expect(points[2].classes).toContain('approved');
            expect(points[2].label).toEqual('Approved');
            expect(points[2].radius).toBeDefined();

            expect(points[3].value).toEqual(26.5);
            expect(points[3].dateTime).toEqual(1598303040000);
            expect(points[3].classes).toContain('revised');
            expect(points[3].label).toEqual('Revised');
            expect(points[3].radius).toBeDefined();
        });
    });

    describe('getUniqueGWKinds', () => {
        it('Return empty array if no groundwater levels are defined', () => {
            expect(getUniqueGWKinds({
                hydrographData: {}
            })).toHaveLength(0);
        });

        it('Return the unique kinds when groundwater levels are defined', () => {
            const points = getUniqueGWKinds(TEST_STATE);
            expect(points.length).toBe(3);
            expect(points[0].classes).toContain('provisional');
            expect(points[0].label).toContain('Provisional');
            expect(points[0].radius).toBeDefined();

            expect(points[1].classes).toContain('approved');
            expect(points[1].label).toContain('Approved');
            expect(points[1].radius).toBeDefined();

            expect(points[2].classes).toContain('revised');
            expect(points[2].label).toContain('Revised');
            expect(points[2].radius).toBeDefined();
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
});
