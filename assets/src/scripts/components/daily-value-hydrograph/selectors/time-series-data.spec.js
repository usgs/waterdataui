import {
    getCurrentTimeSeriesData,
    getCurrentTimeSeriesPoints,
    getCurrentTimeSeriesSegments,
    getCursorEpochTime,
    getCurrentDataPointAtCursor,
    getCurrentUniqueDataKinds
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
                        phenomenonTimeEnd: '2018-01-10',
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

    describe('getCurrentTimeSeriesData', () => {
        it('should return an empty array if no current time series is defined', () => {
            expect(getCurrentTimeSeriesData({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toEqual([]);
        });

        it('should return an array of objects representing the time series', () => {
            const result = getCurrentTimeSeriesData(TEST_STATE);

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

    describe('getCurrentTimeSeriesPoints', () => {
        it('Should return an empty array if not current time series is defined', () => {
            expect(getCurrentTimeSeriesPoints({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toEqual([]);
        });

        it('should return 3 masked points and 5 non masked points', () => {
            const result = getCurrentTimeSeriesPoints(TEST_STATE);

            expect(result[0]).toEqual({
                value: '5.0',
                dateTime: 1514851200000,
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
            expect(result[1]).toEqual({
                value: '4.0' +
                    '',
                dateTime: 1514937600000,
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
            expect(result[2]).toEqual({
                value: '6.1',
                dateTime: 1515024000000,
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
            expect(result[3]).toEqual({
                value: '3.2',
                dateTime: 1515110400000,
                isMasked: true,
                label: 'Ice affected',
                class: 'mask-0'
            });
            expect(result[4]).toEqual({
                value: '7.3',
                dateTime: 1515196800000,
                isMasked: true,
                label: 'Equipment malfunction, Ice affected',
                class: 'mask-1'
            });
            expect(result[5]).toEqual({
                value: '8.1',
                dateTime: 1515283200000,
                isMasked: true,
                label: 'Equipment malfunction, Ice affected',
                class: 'mask-1'
            });
            expect(result[6]).toEqual({
                value: '6.2',
                dateTime: 1515369600000,
                isMasked: false,
                label: 'Estimated',
                class: 'estimated'
            });
            expect(result[7]).toEqual({
                value: '2.9',
                dateTime: 1515456000000,
                isMasked: false,
                label: 'Estimated',
                class: 'estimated'
            });
            expect(result[8]).toEqual({
                value: '3.4',
                dateTime: 1515542400000,
                isMasked: false,
                label: 'Provisional',
                class: 'provisional'
            });
        });
    });

    describe('getCurrentTimeSeriesSegments', () => {
        it('Should return an empty array if no current time series is defined', () => {
            expect(getCurrentTimeSeriesSegments({
               dailyValueTimeSeriesData: {},
               dailyValueTimeSeriesState: {}
            })).toEqual([]);
        });

        it('Should return a three line segments and two mask segments', () => {
            const result = getCurrentTimeSeriesSegments(TEST_STATE);

            expect(result.length).toBe(5);
            expect(result[0].isMasked).toBe(false);
            expect(result[0].label).toBe('Approved');
            expect(result[0].class).toBe('approved');
            expect(result[0].points).toEqual([
                {value: 5, dateTime: 1514851200000},
                {value: 4, dateTime: 1514937600000},
                {value: 6.1, dateTime: 1515024000000}
            ]);

            expect(result[1].isMasked).toBe(true);
            expect(result[1].points.map(pt => pt.dateTime)).toEqual([
                1515024000000, 1515110400000, 1515196800000
            ]);
            expect(result[1].label).toBe('Ice affected');
            expect(result[1].class).toBe('mask-0');

            expect(result[2].isMasked).toBe(true);
            expect(result[2].points.map(pt => pt.dateTime)).toEqual([
                1515196800000, 1515283200000, 1515369600000
            ]);
            expect(result[2].label).toBe('Equipment malfunction, Ice affected');
            expect(result[2].class).toBe('mask-1');

            expect(result[3].isMasked).toBe(false);
            expect(result[3].points).toEqual([
                {value: 6.2, dateTime: 1515369600000},
                {value: 2.9, dateTime: 1515456000000}
            ]);
            expect(result[3].label).toBe('Estimated');
            expect(result[3].class).toBe('estimated');

            expect(result[4].isMasked).toBe(false);
            expect(result[4].points).toEqual([
                {value: 2.9, dateTime: 1515456000000},
                {value: 3.4, dateTime: 1515542400000}
            ]);
            expect(result[4].label).toBe('Provisional');
            expect(result[4].class).toBe('provisional');
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
            expect(result.length).toBe(2);
            expect(result.filter(segment => !segment.isMasked).length).toBe(2);
            expect(result[0].points.length).toBe(1);
            expect(result[1].points.length).toBe(3);
        });
    });

    describe('getCurrentUniqueDataKinds', () => {
        it('should return an empty array if no dv time series', () => {
            expect(getCurrentUniqueDataKinds({
               dailyValueTimeSeriesData: {},
               dailyValueTimeSeriesState: {}
            })).toEqual([]);
        });

        it('should return the unique data kinds', () => {
            const result = getCurrentUniqueDataKinds({
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
                                qualifiers: [null, ['ICE'], null, ['ICE']],
                                grades: [['50'], ['50'], ['60'], ['60']]
                            }
                        }
                    }
                },
                dailyValueTimeSeriesState: {
                    currentDVTimeSeriesId: '12345'
                }
            });
            expect(result.length).toBe(2);
            expect(result).toContain({
                isMasked: true,
                label: 'Ice affected',
                class: 'mask-0'
            });
            expect(result).toContain({
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
        });
    });

    describe('getCursorEpochTime', () => {
        it('should return latest time if cursor offset is not set', () => {
            expect(getCursorEpochTime(TEST_STATE)).toEqual(1515542400000);
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

    describe('getCurrentDataPointAtCursor', () => {
        it('should return last point if cursor offset is not set', () => {
            expect(getCurrentDataPointAtCursor(TEST_STATE)).toEqual({
                value: '3.4',
                dateTime: 1515542400000,
                isMasked: false,
                label: 'Provisional',
                class: 'provisional'
            });
        });

        it('should return the point nearest the cursor offset', () => {
            expect(getCurrentDataPointAtCursor({
                ...TEST_STATE,
                dailyValueTimeSeriesState: {
                    ...TEST_STATE.dailyValueTimeSeriesState,
                    dvGraphCursorOffset: 86400000
                }
            })).toEqual({
                value: '4.0',
                dateTime: 1514937600000,
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
        });
    });
});
