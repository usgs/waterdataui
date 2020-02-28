import {
    getCurrentTimeSeriesPoints,
    getCurrentTimeSeriesLineSegments,
    getCursorEpochTime,
    getDataAtCursor
} from './time-series-data';

fdescribe('time-series-data module', () => {
    const TEST_STATE = {
        observationsData: {
            timeSeries: {
                '12345': {
                    type: 'Feature',
                    id: '12345',
                    properties: {
                        phenomenonTimeStart: '2018-01-02',
                        phenomenonTimeEnd: '2018-01-05',
                        timeStep: ['2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05'],
                        result: ['5.0', '4.0', '6.1', '3.2'],
                        approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved']],
                        nilReason: [null, 'AA', null, null],
                        qualifiers: [null, null, ['ICE'], ['ICE']],
                        grades: [['50'], ['50'], ['60'], ['60']]
                    }
                }
            }
        },
        observationsState: {
            currentTimeSeriesId: '12345'
        },
        ui: {
            windowWidth: 1024,
            width: 800
        }
    };
    describe('getCurrentTimeSeriesPoints', () => {
        it('should return an empty array if no current time series is defined', () => {
            expect(getCurrentTimeSeriesPoints({
                observationsData: {},
                observationsState: {}
            })).toEqual([]);
        });

        it('should return an array of objects representing the time series', () => {
            const result = getCurrentTimeSeriesPoints(TEST_STATE);

            expect(result.length).toBe(4);
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
        });
    });

    describe('getCurrentTimeSeriesLineSegments', () => {
        it('Should return an empty array if no current time series is defined', () => {
           expect(getCurrentTimeSeriesLineSegments({
               observationsData: {},
               observationsState: {}
           })).toEqual([]);
        });

        it('Should return a single line segment if time series has no gaps or changes in approvals', () => {
            const result = getCurrentTimeSeriesLineSegments(TEST_STATE);

            expect(result.length).toBe(1);
            expect(result[0].points.length).toBe(4);
            expect(result[0].points[0]).toEqual({
                date: 1514851200000,
                value: 5.0
            });
            expect(result[0].approvals).toEqual(['Approved']);
        });

        it('Should return a two line segments if time series has two day gap', () => {
            const result = getCurrentTimeSeriesLineSegments({
                observationsData: {
                    timeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                timeStep: ['2018-01-02', '2018-01-04', '2018-01-05', '2018-01-06'],
                                result: ['5.0', '4.0', '6.1', '3.2'],
                                approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved']],
                                nilReason: [null, 'AA', null, null],
                                qualifiers: [null, null, ['ICE'], ['ICE']],
                                grades: [['50'], ['50'], ['60'], ['60']]
                            }
                        }
                    }
                },
                observationsState: {
                    currentTimeSeriesId: '12345'
                }
            });
            expect(result.length).toBe(2);
            expect(result[0].points.length).toBe(1);
            expect(result[1].points.length).toBe(3);
        });

        it('should return two line segment if the time series approvals change', () => {
            const result = getCurrentTimeSeriesLineSegments({
                observationsData: {
                    timeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                timeStep: ['2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05'],
                                result: ['5.0', '4.0', '6.1', '3.2'],
                                approvals: [['Estimated', 'Approved'], ['Estimated', 'Approved'], ['Approved'], ['Approved']],
                                nilReason: [null, 'AA', null, null],
                                qualifiers: [null, null, ['ICE'], ['ICE']],
                                grades: [['50'], ['50'], ['60'], ['60']]
                            }
                        }
                    }
                },
                observationsState: {
                    currentTimeSeriesId: '12345'
                }
            });
            expect(result.length).toBe(2);
            expect(result[0].points.length).toBe(3);
            expect(result[1].points.length).toBe(2);
        });
    });

    describe('getCursorEpochTime', () => {
        it('should return null if cursor offset is not set', () => {
            expect(getCursorEpochTime(TEST_STATE)).toBeNull();
        });

        it('should return the epoch time of the offset', () => {
            expect(getCursorEpochTime({
                ...TEST_STATE,
                observationsState: {
                    ...TEST_STATE.observationsState,
                    cursorOffset: 86400000
                }
            })).toEqual(1514937600000);
        });
    });

    describe('getDataAtCursor', () => {
        it('should return null if cursor offset is not set', () => {
            expect(getDataAtCursor(TEST_STATE)).toBeNull();
        });

        it('should return the point nearest the cursor offset', () => {
            expect(getDataAtCursor({
                ...TEST_STATE,
                observationsState: {
                    ...TEST_STATE.observationsState,
                    cursorOffset: 86400000
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
