import {
    getCurrentTimeSeriesPoints,
    getCurrentTimeSeriesSegments,
    getCursorEpochTime,
    getDataAtCursor
} from './time-series-data';

describe('components/daily-value-hydrograph/time-series-data module', () => {
    const TEST_STATE = {
        dailyValueTimeSeriesData: {
            dvTimeSeries: {
                '12345': {
                    type: 'Feature',
                    id: '12345',
                    properties: {
                        phenomenonTimeStart: '2018-01-02',
                        phenomenonTimeEnd: '2018-01-05',
                        timeStep: ['2018-01-05', '2018-01-03', '2018-01-02', '2018-01-04',
                            '2018-01-06', '2018-01-07', '2018-01-08', '2018-01-09', '2018-01-10'],
                        result: [ '3.2', '4.0', '5.0', '6.1',
                            '7.3', '8.1', '6.2', '2.9', '3.4'],
                        approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved'],
                            ['Approved'], ['Approved'], ['Approved'], ['Approved'], ['Working']],
                        nilReason: [null, 'AA', null, null, null, null, null, null, null],
                        qualifiers: [['ICE'], null, null, null,
                            ['ICE', 'EQUIP'], ['ICE', 'EQUIP'], ['ESTIMATED'], ['ESTIMATED'], null],
                        grades: [['60'], ['50'], ['50'], ['60'], ['50'], ['50'], ['50'], ['50'], ['50']]
                    }
                }
            }
        },
        dailyValueTimeSeriesState: {
            currentDVTimeSeriesId: '12345'
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };
    describe('getCurrentTimeSeriesPoints', () => {
        it('should return an empty array if no current time series is defined', () => {
            expect(getCurrentTimeSeriesPoints({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toEqual([]);
        });

        it('should return an array of objects representing the time series', () => {
            const result = getCurrentTimeSeriesPoints(TEST_STATE);

            expect(result.length).toBe(9);
            expect(result[0]).toEqual({
                value: '5.0',
                dateTime: 1514851200000,
                approvals: ['Approved'],
                nilReason: null,
                qualifiers: null,
                grades: ['50']
            });
            expect(result[3]).toEqual({
                value: '3.2',
                dateTime: 1515110400000,
                approvals: ['Approved'],
                nilReason: null,
                qualifiers: ['ICE'],
                grades: ['60']
            });
            expect(result[8]).toEqual({
                value: '3.4',
                dateTime: 1515542400000,
                approvals: ['Working'],
                nilReason: null,
                qualifiers: null,
                grades: ['50']
            });
        });
    });

    describe('getCurrentTimeSeriesSegments', () => {
        it('Should return an object with empty lineSegments and maskSegments if no current time series is defined', () => {
            const result = getCurrentTimeSeriesSegments({
               dailyValueTimeSeriesData: {},
               dailyValueTimeSeriesState: {}
            });
            expect(result.lineSegments).toEqual([]);
            expect(result.maskSegments).toEqual([]);
        });

        it('Should return a three line segments and two mask segments', () => {
            const result = getCurrentTimeSeriesSegments(TEST_STATE);

            expect(result.lineSegments.length).toBe(3);
            expect(result.maskSegments.length).toBe(2);

            expect(result.lineSegments[0].class).toEqual({
                label: 'Approved',
                class: 'approved'
            });
            expect(result.lineSegments[0].points).toEqual([
                {value: '5.0', dateTime: 1514851200000},
                {value: '4.0', dateTime: 1514937600000},
                {value: '6.1', dateTime: 1515024000000}
            ]);
            expect(result.lineSegments[1].class).toEqual({
                label: 'Estimated',
                class: 'estimated'
            });
            expect(result.lineSegments[1].points).toEqual([
                {value: '6.2', dateTime: 1515369600000},
                {value: '2.9', dateTime: 1515456000000}
            ]);
            expect(result.lineSegments[2].class).toEqual({
                label: 'Provisional',
                class: 'provisional'
            });
            expect(result.lineSegments[2].points).toEqual([
                {value: '2.9', dateTime: 1515456000000},
                {value: '3.4', dateTime: 1515542400000}
            ]);

            expect(result.maskSegments[0]).toEqual({
                startTime: 1515024000000,
                endTime: 1515196800000,
                qualifiers: {label: 'Ice affected', class: 'mask-0'}
            });
            expect(result.maskSegments[1]).toEqual({
                startTime: 1515196800000,
                endTime: 1515369600000,
                qualifiers: {label: 'Equipment malfunction, Ice affected', class: 'mask-1'}
            });
        });

        it('Should return a two line segments if time series has two day gap', () => {
            const result = getCurrentTimeSeriesSegments({
                dailyValueTimeSeriesData: {
                    dvTimeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                timeStep: ['2018-01-02', '2018-01-04', '2018-01-05', '2018-01-06'],
                                result: ['5.0', '4.0', '6.1', '3.2'],
                                approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved']],
                                nilReason: [null, 'AA', null, null],
                                qualifiers: [null, null, null, null],
                                grades: [['50'], ['50'], ['60'], ['60']]
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            });
            expect(result.lineSegments.length).toBe(2);
            expect(result.maskSegments.length).toBe(0);
            expect(result.lineSegments[0].points.length).toBe(1);
            expect(result.lineSegments[1].points.length).toBe(3);
        });
    });

    describe('getCursorEpochTime', () => {
        it('should return latest time if cursor offset is not set', () => {
            expect(getCursorEpochTime(TEST_STATE)).toEqual(1515110400000);
        });

        it('should return the epoch time of the offset', () => {
            expect(getCursorEpochTime({
                ...TEST_STATE,
                dailyValueTimeSeriesState: {
                    ...TEST_STATE.dailyValueTimeSeriesState,
                    dvGraphCursorOffset: 86400000
                }
            })).toEqual(1514937600000);
        });
    });

    describe('getDataAtCursor', () => {
        it('should return last point if cursor offset is not set', () => {
            expect(getDataAtCursor(TEST_STATE)).toEqual({
                value: '3.2',
                dateTime: 1515110400000,
                approvals: ['Approved'],
                nilReason: null,
                qualifiers: ['ICE'],
                grades: ['60']
            });
        });

        it('should return the point nearest the cursor offset', () => {
            expect(getDataAtCursor({
                ...TEST_STATE,
                dailyValueTimeSeriesState: {
                    ...TEST_STATE.dailyValueTimeSeriesState,
                    dvGraphCursorOffset: 86400000
                }
            })).toEqual({
                value: '4.0',
                dateTime: 1514937600000,
                approvals: ['Approved'],
                nilReason: 'AA',
                qualifiers: null,
                grades: ['50']
            });
        });
    });
});
