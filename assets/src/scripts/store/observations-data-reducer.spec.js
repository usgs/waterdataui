import {observationsDataReducer} from './observations-data-reducer';

describe('observationsDataReducer', () => {

    describe('action SET_OBSERVATIONS_TIME_SERIES', () => {
        it('Should merge the new time series into the observationsData.timeSeries', () => {
            expect(observationsDataReducer({
                timeSeries: {
                    'abc123': {
                        type: 'FEATURE',
                        properties: {
                            timeStep: ['2000-01-01', '2000-01-02', '2000-01-03'],
                            result: ['1', '2', '3']
                        }
                    }
                }
            }, {
                type: 'SET_OBSERVATIONS_TIME_SERIES',
                timeSeriesId: '4a5b',
                data: {
                    type: 'FEATURE',
                    properties: {
                        timeStep: ['2001-01-01', '2001-01-02', '2001-01-03'],
                        result: ['4', '5', '6']
                    }
                }
            })).toEqual({
                timeSeries: {
                    'abc123': {
                        type: 'FEATURE',
                        properties: {
                            timeStep: ['2000-01-01', '2000-01-02', '2000-01-03'],
                            result: ['1', '2', '3']
                        }
                    },
                    '4a5b': {
                        type: 'FEATURE',
                        properties: {
                            timeStep: ['2001-01-01', '2001-01-02', '2001-01-03'],
                            result: ['4', '5', '6']
                        }
                    }
                }
            });
        });

        it('Should replace the existing time series data for the same timeSeriesId', () => {
            expect(observationsDataReducer({
                timeSeries: {
                    'abc123': {
                        type: 'FEATURE',
                        properties: {
                            timeStep: ['2000-01-01', '2000-01-02', '2000-01-03'],
                            result: ['1', '2', '3']
                        }
                    }
                }
            }, {
                type: 'SET_OBSERVATIONS_TIME_SERIES',
                timeSeriesId: 'abc123',
                data: {
                    type: 'FEATURE',
                    properties: {
                        timeStep: ['2001-01-01', '2001-01-02', '2001-01-03'],
                        result: ['4', '5', '6']
                    }
                }
            })).toEqual({
                timeSeries: {
                    'abc123': {
                        type: 'FEATURE',
                        properties: {
                            timeStep: ['2001-01-01', '2001-01-02', '2001-01-03'],
                            result: ['4', '5', '6']
                        }
                    }
                }
            });
        });
    });
});