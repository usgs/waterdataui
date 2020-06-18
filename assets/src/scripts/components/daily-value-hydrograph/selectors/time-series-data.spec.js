import {
    getCurrentTimeSeriesPoints,
    getCurrentTimeSeriesSegments,
    getCursorEpochTime,
    getCurrentDataPointsAtCursor,
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
                },
                '12346': {
                    type: 'Feature',
                    id: '12346',
                    properties: {
                        phenomenonTimeStart: '2018-01-02',
                        phenomenonTimeEnd: '2018-01-10',
                        timeStep: ['2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05',
                            '2018-01-06', '2018-01-07', '2018-01-08', '2018-01-09', '2018-01-10'],
                        result: [ '5.2', '3.0', '6.0', '7.1',
                            '8.3', '9.1', '7.2', '3.9', '4.4'],
                        approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved'],
                            ['Approved'], ['Approved'], ['Approved'], ['Approved'], ['Working']],
                        nilReason: [null, 'AA', null, null, null, null, null, null, null],
                        qualifiers: [null, null, null, ['ICE'],
                            ['ICE', 'EQUIP'], ['ICE', 'EQUIP'], ['ESTIMATED'], ['ESTIMATED'], null],
                        grades: [['50'], ['50'], ['50'], ['60'], ['50'], ['50'], ['50'], ['50'], ['50']]
                    }
                }
            }
        },
        dailyValueTimeSeriesState: {
            currentDVTimeSeriesId: {
                min: '12345',
                mean: null,
                max: '12346'
            }
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };

    describe('getCurrentTimeSeriesPoints', () => {
        it('Should return an empty array if not current time series is defined', () => {
            expect(getCurrentTimeSeriesPoints({
                dailyValueTimeSeriesData: {},
                dailyValueTimeSeriesState: {}
            })).toEqual({
                min: [],
                mean: [],
                max: []
            });
        });

        it('should return 3 masked points and 5 non masked points for min and max', () => {
            const result = getCurrentTimeSeriesPoints(TEST_STATE);
            const minResult = result.min;
            const meanResult = result.mean;
            const maxResult = result.max;

            expect(minResult[0]).toEqual({
                value: '5.0',
                dateTime: 1514851200000,
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
            expect(minResult[1]).toEqual({
                value: '4.0' +
                    '',
                dateTime: 1514937600000,
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
            expect(minResult[2]).toEqual({
                value: '6.1',
                dateTime: 1515024000000,
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
            expect(minResult[3]).toEqual({
                value: '3.2',
                dateTime: 1515110400000,
                isMasked: true,
                label: 'Ice affected',
                class: 'mask-0'
            });
            expect(minResult[4]).toEqual({
                value: '7.3',
                dateTime: 1515196800000,
                isMasked: true,
                label: 'Equipment malfunction, Ice affected',
                class: 'mask-1'
            });
            expect(minResult[5]).toEqual({
                value: '8.1',
                dateTime: 1515283200000,
                isMasked: true,
                label: 'Equipment malfunction, Ice affected',
                class: 'mask-1'
            });
            expect(minResult[6]).toEqual({
                value: '6.2',
                dateTime: 1515369600000,
                isMasked: false,
                label: 'Estimated',
                class: 'estimated'
            });
            expect(minResult[7]).toEqual({
                value: '2.9',
                dateTime: 1515456000000,
                isMasked: false,
                label: 'Estimated',
                class: 'estimated'
            });
            expect(minResult[8]).toEqual({
                value: '3.4',
                dateTime: 1515542400000,
                isMasked: false,
                label: 'Provisional',
                class: 'provisional'
            });
            expect(meanResult.length).toBe(0);
            expect(maxResult.length).toBe(9);
        });
    });

    describe('getCurrentTimeSeriesSegments', () => {
        it('Should return an empty array if no current time series is defined', () => {
            expect(getCurrentTimeSeriesSegments({
               dailyValueTimeSeriesData: {},
               dailyValueTimeSeriesState: {}
            })).toEqual({
                min: [],
                mean: [],
                max: []
            });
        });

        it('Should return a three line segments and two mask segments for min and max', () => {
            const result = getCurrentTimeSeriesSegments(TEST_STATE);
            const minResult = result.min;
            const meanResult = result.mean;
            const maxResult = result.max;

            expect(minResult.length).toBe(5);
            expect(minResult[0].isMasked).toBe(false);
            expect(minResult[0].label).toBe('Approved');
            expect(minResult[0].class).toBe('approved');
            expect(minResult[0].points).toEqual([
                {value: 5, dateTime: 1514851200000},
                {value: 4, dateTime: 1514937600000},
                {value: 6.1, dateTime: 1515024000000}
            ]);

            expect(minResult[1].isMasked).toBe(true);
            expect(minResult[1].points.map(pt => pt.dateTime)).toEqual([
                1515024000000, 1515110400000, 1515196800000
            ]);
            expect(minResult[1].label).toBe('Ice affected');
            expect(minResult[1].class).toBe('mask-0');

            expect(minResult[2].isMasked).toBe(true);
            expect(minResult[2].points.map(pt => pt.dateTime)).toEqual([
                1515196800000, 1515283200000, 1515369600000
            ]);
            expect(minResult[2].label).toBe('Equipment malfunction, Ice affected');
            expect(minResult[2].class).toBe('mask-1');

            expect(minResult[3].isMasked).toBe(false);
            expect(minResult[3].points).toEqual([
                {value: 6.2, dateTime: 1515369600000},
                {value: 2.9, dateTime: 1515456000000}
            ]);
            expect(minResult[3].label).toBe('Estimated');
            expect(minResult[3].class).toBe('estimated');

            expect(minResult[4].isMasked).toBe(false);
            expect(minResult[4].points).toEqual([
                {value: 2.9, dateTime: 1515456000000},
                {value: 3.4, dateTime: 1515542400000}
            ]);
            expect(minResult[4].label).toBe('Provisional');
            expect(minResult[4].class).toBe('provisional');

            expect(meanResult.length).toBe(0);
            expect(maxResult.length).toBe(5);
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
                    currentDVTimeSeriesId: {
                        min: '12345',
                        mean: null,
                        max: null
                    }
                }
            });
            expect(result.min.length).toBe(2);
            expect(result.min.filter(segment => !segment.isMasked).length).toBe(2);
            expect(result.min[0].points.length).toBe(1);
            expect(result.min[1].points.length).toBe(3);
        });
    });

    describe('getCurrentUniqueDataKinds', () => {
        it('should return an empty array if no dv time series', () => {
            expect(getCurrentUniqueDataKinds({
               dailyValueTimeSeriesData: {},
               dailyValueTimeSeriesState: {}
            })).toEqual({
                min: [],
                mean: [],
                max: []
            });
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
                    currentDVTimeSeriesId: {
                        min: '12345',
                        mean: null,
                        max: null
                    }
                }
            });
            expect(result.min.length).toBe(2);
            expect(result.min).toContain({
                isMasked: true,
                label: 'Ice affected',
                class: 'mask-0'
            });
            expect(result.min).toContain({
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
            expect(result.mean.length).toBe(0);
            expect(result.max.length).toBe(0);
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

    describe('getCurrentDataPointsAtCursor', () => {
        it('should return last point if cursor offset is not set', () => {
            const result = getCurrentDataPointsAtCursor(TEST_STATE);
            expect(result.min).toEqual({
                value: '3.4',
                dateTime: 1515542400000,
                isMasked: false,
                label: 'Provisional',
                class: 'provisional'
            });
            expect(result.mean).toBeNull();
            expect(result.max).toEqual({
                value: '4.4',
                dateTime: 1515542400000,
                isMasked: false,
                label: 'Provisional',
                class: 'provisional'
            });
        });

        it('should return the point nearest the cursor offset', () => {
            const result = getCurrentDataPointsAtCursor({
                ...TEST_STATE,
                dailyValueTimeSeriesState: {
                    ...TEST_STATE.dailyValueTimeSeriesState,
                    dvGraphCursorOffset: 86400000
                }
            });
            expect(result.min).toEqual({
                value: '4.0',
                dateTime: 1514937600000,
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
            expect(result.mean).toBeNull();
            expect(result.max).toEqual({
                value: '3.0',
                dateTime: 1514937600000,
                isMasked: false,
                label: 'Approved',
                class: 'approved'
            });
        });
    });
});
