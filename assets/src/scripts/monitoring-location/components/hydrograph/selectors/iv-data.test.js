
import {getIVDataPoints, getIVTableData, getIVDataSegments, getIVUniqueDataKinds} from './iv-data';

describe('monitoring-location/components/hydrograph/selectors/iv-data', () => {
    const TEST_IV_DATA = {
        parameter: {
            parameterCode: '72019',
            name: 'Depth to water level'
        },
        values: {
            '90649': {
                points: [
                    {value: 24.2, qualifiers: ['A'], dateTime: 1582560900000},
                    {value: 24.1, qualifiers: ['A'], dateTime: 1582561800000},
                    {value: null, qualifiers: ['A', 'ICE'], dateTime: 1582562700000},
                    {value: null, qualifiers: ['A', 'ICE'], dateTime: 1582569900000},
                    {value: 25.2, qualifiers: ['E'], dateTime: 1582570800000},
                    {value: 25.4, qualifiers: ['E'], dateTime: 1600617600000},
                    {value: 25.6, qualifiers: ['E'], dateTime: 1600618500000},
                    {value: 26.5, qualifiers: ['P'], dateTime: 1600619400000},
                    {value: 25.9, qualifiers: ['P'], dateTime: 1600620300000}
                ],
                method: {
                    methodID: '90649'
                }
            }
        }
    };

    const TEST_STATE = {
        hydrographData: {
            primaryIVData: TEST_IV_DATA
        },
        hydrographState: {
            selectedIVMethodID: '90649'
        }
    };

    describe('getIVDataPoints', () => {
        it('Returns null if no data of data kind exists', () => {
            expect(getIVDataPoints('compare')(TEST_STATE)).toBeNull();
        });

        it('Returns the iv data points with the correct properties', () => {
            const points = getIVDataPoints('primary')(TEST_STATE);
            expect(points['90649']).toBeDefined();
            expect(points['90649']).toHaveLength(9);
            expect(points['90649'][0]).toEqual({
                value: 24.2,
                dateTime: 1582560900000,
                isMasked: false,
                maskedQualifer: undefined,
                approvalQualifier: 'a',
                label: 'Approved',
                class: 'approved'
            });
            expect(points['90649'][2]).toEqual({
                value: null,
                dateTime: 1582562700000,
                isMasked: true,
                maskedQualifier: 'ice',
                approvalQualifier: 'a',
                label: 'Ice Affected',
                class: 'ice-affected-mask'
            });
            expect(points['90649'][4]).toEqual({
                value: 25.2,
                dateTime: 1582570800000,
                isMasked: false,
                maskedQualifier: undefined,
                approvalQualifier: 'e',
                label: 'Estimated',
                class: 'estimated'
            });
            expect(points['90649'][7]).toEqual({
                value: 26.5,
                dateTime: 1600619400000,
                isMasked: false,
                maskedQualifier: undefined,
                approvalQualifier: undefined,
                label: 'Provisional',
                class: 'provisional'
            });
        });
    });

    describe('getIVTableData', () => {
        it('Expect to return an empty array if no IV data', () => {
            expect(getIVTableData('compare')(TEST_STATE)).toHaveLength(0);
        });

        it('Expect to return requested IV data with appropriate properties', () => {
            const points = getIVTableData('primary')(TEST_STATE);
            expect(points).toHaveLength(9);
            expect(points[0]).toEqual({
                parameterName: 'Depth to water level',
                result: 24.2,
                dateTime: '2020-02-24T10:15:00.000-06:00',
                approvals: 'Approved',
                masks: ''
            });
            expect(points[2]).toEqual({
                parameterName: 'Depth to water level',
                result: null,
                dateTime: '2020-02-24T10:45:00.000-06:00',
                approvals: 'Approved',
                masks: 'Ice Affected'
            });
            expect(points[4]).toEqual({
                parameterName: 'Depth to water level',
                result: 25.2,
                dateTime: '2020-02-24T13:00:00.000-06:00',
                approvals: 'Estimated',
                masks: ''
            });
            expect(points[7]).toEqual({
                parameterName: 'Depth to water level',
                result: 26.5,
                dateTime: '2020-09-20T11:30:00.000-05:00',
                approvals: 'Provisional',
                masks: ''
            });
        });
    });
    describe('getIVDataSegments', () => {
       it('Expects null if no IV of the data kind exists', () => {
           expect(getIVDataSegments('compare')(TEST_STATE)).toBeNull();
       });

       it('Returns the expected data segments', () => {
           const segmentsByMethodID = getIVDataSegments('primary')(TEST_STATE);
           expect(segmentsByMethodID['90649']).toBeDefined();
           const segments = segmentsByMethodID['90649'];
           expect(segments).toHaveLength(5);
           expect(segments[0]).toEqual({
               isMasked: false,
               points: [
                   {value: 24.2, dateTime: 1582560900000},
                   {value: 24.1, dateTime: 1582561800000}
               ],
               label: 'Approved',
               class: 'approved'
           });
           expect(segments[1]).toEqual({
               isMasked: true,
               points: [
                   {value: 24.1, dateTime: 1582561800000},
                   {value: null, dateTime: 1582562700000},
                   {value: null, dateTime: 1582569900000},
                   {value: 25.2, dateTime: 1582570800000}
               ],
               label: 'Ice Affected',
               class: 'ice-affected-mask'
           });
           expect(segments[2]).toEqual({
               isMasked: false,
               points: [{value: 25.2, dateTime: 1582570800000}],
               label: 'Estimated',
               class: 'estimated'
           });
           expect(segments[3]).toEqual({
               isMasked: false,
               points: [
                   {value: 25.4, dateTime: 1600617600000},
                   {value: 25.6, dateTime: 1600618500000}
               ],
               label: 'Estimated',
               class: 'estimated'
           });
           expect(segments[4]).toEqual({
               isMasked: false,
               points: [
                   {value: 25.6, dateTime: 1600618500000},
                   {value: 26.5, dateTime: 1600619400000},
                   {value: 25.9, dateTime: 1600620300000}
               ],
               label: 'Provisional',
               class: 'provisional'
           });
       });
    });

    describe('getIVUniqueDataKinds', () => {
        it('returns an empty array if no IV data of data kind exists', () => {
            expect(getIVUniqueDataKinds('compare')(TEST_STATE)).toHaveLength(0);
        });

        it('Returns expected unique data kind for the IV data', () => {
            const uniqueData = getIVUniqueDataKinds('primary')(TEST_STATE);
            expect(uniqueData).toHaveLength(4);
            expect(uniqueData[0]).toEqual({
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
            expect(uniqueData[1]).toEqual({
                isMasked:  true,
                label: 'Ice Affected',
                class: 'ice-affected-mask'
            });
            expect(uniqueData[2]).toEqual({
                isMasked: false,
                label: 'Estimated',
                class: 'estimated'
            });
            expect(uniqueData[3]).toEqual({
                isMasked: false,
                label: 'Provisional',
                class: 'provisional'
            });
        });
    });
});
