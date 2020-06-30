
import {getAvailableParameterCodes} from './parameter-data';

describe('monitoring-location/components/hydrograph/selectors/parameter-data', () => {
    describe('getAvailableParameterCodes', () => {
        it('sets attributes correctly when all series have data points', () => {
            const available = getAvailableParameterCodes({
                ivTimeSeriesData: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current:P7D', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current:P7D', variable: 'code1', points: [{x: 2, y: 3}]},
                        'current:00062': {description: '00062', tsKey: 'current:P7D', variable: 'code2', points: [{x: 3, y: 4}]},
                        'compare:00061': {description: '00061', tsKey: 'compare:P7D', variable: 'code1', points: [{x: 1, y: 17}]},
                        'compare:00062': {description: '00062', tsKey: 'compare:P7D', variable: 'code2', points: [{x: 2, y: 18}]},
                        'compare:00063': {description: '00063', tsKey: 'compare:P7D', variable: 'code3', points: [{x: 3, y: 46}]}
                    },
                    variables: {
                        'code0': {
                            oid: 'code0',
                            variableDescription: 'code0 desc',
                            variableCode: {
                                value: '00060'
                            }
                        },
                        'code1': {
                            oid: 'code1',
                            variableDescription: 'code1 desc',
                            variableCode: {
                                value: '00061'
                            }
                        },
                        'code2': {
                            oid: 'code2',
                            variableDescription: 'code2 desc',
                            variableCode: {
                                value: '00062'
                            }
                        },
                        'code3': {
                            oid: 'code3',
                            variableDescription: 'code3 desc',
                            variableCode: {
                                value: '00063'
                            }
                        }
                    }
                },
                ivTimeSeriesState: {
                    currentIVVariableID: 'code0'
                }
            });
            // Series are ordered by parameter code and have expected values.
            expect(available).toEqual([
                ['00060', {variableID: 'code0', description: 'code0 desc', selected: true, currentTimeSeriesCount: 1}],
                ['00061', {variableID: 'code1', description: 'code1 desc', selected: false, currentTimeSeriesCount: 1}],
                ['00062', {variableID: 'code2', description: 'code2 desc', selected: false, currentTimeSeriesCount: 1}]
            ]);
        });

        it('sets attributes correctly when not all series have data points', () => {
            const available = getAvailableParameterCodes({
                ivTimeSeriesData: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current:P7D', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current:P7D', variable: 'code1', points: [{x: 2, y: 3}]},
                        'current:00062': {description: '00062', tsKey: 'current:P7D', variable: 'code2', points: [{x: 3, y: 4}]},
                        'compare:00061': {description: '00061', tsKey: 'compare:P7D', variable: 'code1', points: []},
                        'compare:00062': {description: '00062', tsKey: 'compare:P7D', variable: 'code2', points: [{x: 2, y: 18}]},
                        'compare:00063': {description: '00063', tsKey: 'compare:P7D', variable: 'code3', points: [{x: 3, y: 46}]}
                    },
                    variables: {
                        'code0': {
                            oid: 'code0',
                            variableDescription: 'code0 desc',
                            variableCode: {
                                value: '00060'
                            }
                        },
                        'code1': {
                            oid: 'code1',
                            variableDescription: 'code1 desc',
                            variableCode: {
                                value: '00061'
                            }
                        },
                        'code2': {
                            oid: 'code2',
                            variableDescription: 'code2 desc',
                            variableCode: {
                                value: '00062'
                            }
                        },
                        'code3': {
                            oid: 'code3',
                            variableDescription: 'code3 desc',
                            variableCode: {
                                value: '00063'
                            }
                        }
                    }
                },
                ivTimeSeriesState: {
                    currentIVVariableID: 'code0'
                }
            });
            // Series are ordered by parameter code and have expected values.
            expect(available).toEqual([
                ['00060', {variableID: 'code0', description: 'code0 desc', selected: true, currentTimeSeriesCount: 1}],
                ['00061', {variableID: 'code1', description: 'code1 desc', selected: false, currentTimeSeriesCount: 1}],
                ['00062', {variableID: 'code2', description: 'code2 desc', selected: false, currentTimeSeriesCount: 1}]
            ]);
        });

        it('time series without data points are considered available', () => {
            const available = getAvailableParameterCodes({
                ivTimeSeriesData: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current:P7D', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current:P7D', variable: 'code1', points: []},
                        'current:00062': {description: '00062', tsKey: 'current:P7D', variable: 'code2', points: [{x: 3, y: 4}]},
                        'compare:00061': {description: '00061', tsKey: 'compare:P7D', variable: 'code1', points: []},
                        'compare:00062': {description: '00062', tsKey: 'compare:P7D', variable: 'code2', points: [{x: 2, y: 18}]},
                        'compare:00063': {description: '00063', tsKey: 'compare:P7D', variable: 'code3', points: [{x: 3, y: 46}]}
                    },
                    variables: {
                        'code0': {
                            oid: 'code0',
                            variableDescription: 'code0 desc',
                            variableCode: {
                                value: '00060'
                            }
                        },
                        'code1': {
                            oid: 'code1',
                            variableDescription: 'code1 desc',
                            variableCode: {
                                value: '00061'
                            }
                        },
                        'code2': {
                            oid: 'code2',
                            variableDescription: 'code2 desc',
                            variableCode: {
                                value: '00062'
                            }
                        },
                        'code3': {
                            oid: 'code3',
                            variableDescription: 'code3 desc',
                            variableCode: {
                                value: '00063'
                            }
                        }
                    }
                },
                ivTimeSeriesState: {
                    currentIVVariableID: 'code0'
                }
            });
            // Series are ordered by parameter code and have expected values.
            expect(available).toEqual([
                ['00060', {variableID: 'code0', description: 'code0 desc', selected: true, currentTimeSeriesCount: 1}],
                ['00061', {variableID: 'code1', description: 'code1 desc', selected: false, currentTimeSeriesCount: 1}],
                ['00062', {variableID: 'code2', description: 'code2 desc', selected: false, currentTimeSeriesCount: 1}]
            ]);
        });
    });

});