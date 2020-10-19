
import {getAvailableParameterCodes} from 'ivhydrograph/selectors/parameter-data';

describe('monitoring-location/components/hydrograph/selectors/parameter-data', () => {
    describe('getAvailableParameterCodes', () => {
        it('sets attributes correctly when all series have data points', () => {
            const available = getAvailableParameterCodes({
                ivTimeSeriesData: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current:P7D', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current:P7D', variable: 'code1', points: [{x: 2, y: 3}]},
                        'current:00062': {description: '00062', tsKey: 'current:P7D', variable: 'code2', points: [{x: 3, y: 4}]},
                        'compare:00060': {description: '00060', tsKey: 'compare:P7D', variable: 'code0', points: [{x: 3, y: 46}]},
                        'compare:00061': {description: '00061', tsKey: 'compare:P7D', variable: 'code1', points: [{x: 1, y: 17}]},
                        'compare:00062': {description: '00062', tsKey: 'compare:P7D', variable: 'code2', points: [{x: 2, y: 18}]}
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
                {variableID: 'code0', parameterCode: '00060', description: 'code0 desc', selected: true, timeSeriesCount: 1},
                {variableID: 'code1', parameterCode: '00061', description: 'code1 desc', selected: false, timeSeriesCount: 1},
                {variableID: 'code2', parameterCode: '00062', description: 'code2 desc', selected: false, timeSeriesCount: 1}
            ]);
        });

        it('sets attributes correctly when not all series have data points', () => {
            const available = getAvailableParameterCodes({
                ivTimeSeriesData: {
                    timeSeries: {
                        'current:00060': {description: '00060', tsKey: 'current:P7D', variable: 'code0', points: [{x: 1, y: 2}]},
                        'current:00061': {description: '00061', tsKey: 'current:P7D', variable: 'code1', points: []},
                        'current:00062': {description: '00062', tsKey: 'current:P7D', variable: 'code2', points: [{x: 3, y: 4}]}
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
                {variableID: 'code0', parameterCode: '00060', description: 'code0 desc', selected: true, timeSeriesCount: 1},
                {variableID: 'code1', parameterCode: '00061', description: 'code1 desc', selected: false, timeSeriesCount: 1},
                {variableID: 'code2', parameterCode: '00062', description: 'code2 desc', selected: false, timeSeriesCount: 1}
            ]);
        });
    });

});