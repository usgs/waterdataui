import {getCurrentTimeSeriesLineSegments} from './time-series-data';

describe('time-series-line module', () => {
    describe('getCurrentTimeSeriesLineSegments', () => {
        it('Should return an empty array if no current time series is defined', () => {
           expect(getCurrentTimeSeriesLineSegments({
               observationsData: {},
               observationsState: {}
           })).toEqual([]);
        });

        it('Should return a single line segment if time series has no gaps or changes in approvals', () => {
            const result = getCurrentTimeSeriesLineSegments({
                observationsData: {
                    timeSeries: {
                        '12345': {
                            type: 'Feature',
                            id: '12345',
                            properties: {
                                timeStep: ['2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05'],
                                result: ['5.0', '4.0', '6.1', '3.2'],
                                approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved']]
                            }
                        }
                    }
                },
                observationsState: {
                    currentTimeSeriesId: '12345'
                }
            });
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
                                approvals: [['Approved'], ['Approved'], ['Approved'], ['Approved']]
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
                                approvals: [['Estimated', 'Approved'], ['Estimated', 'Approved'], ['Approved'], ['Approved']]
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
});
