
import { seriesReducer } from './series-reducer';

describe('series-reducer', () => {

    describe('ADD_TIME_SERIES_COLLECTION action', () => {
        it('Should add the time series collection to the series as is if series is empty', () => {
            expect(seriesReducer({}, {
                type: 'ADD_TIME_SERIES_COLLECTION',
                data : {
                    stateToMerge: {},
                    timeSeries: {
                        ts: {
                            variable: 'varId',
                            points: [1]
                        }
                    },
                    variables: {
                        'varId': {
                            oid: 'varId',
                            variableCode: {
                                value: 1
                            }
                        }
                    }
                }
            })).toEqual({
                stateToMerge: {},
                timeSeries: {
                    ts: {
                        variable: 'varId',
                        points: [1]
                    }
                },
                variables: {
                    'varId': {
                        oid: 'varId',
                        variableCode: {
                            value: 1
                        }
                    }
                }
            });
        });

        it('Should merge the collection to the series', () => {
            expect(seriesReducer({
                    stateToMerge: {},
                    timeSeries: {
                        ts: {
                            variable: 'varId',
                            points: [1]
                        }
                    },
                    variables: {
                        'varId': {
                            oid: 'varId',
                            variableCode: {
                                value: 1
                            }
                        }
                    }
                }, {
                    type: 'ADD_TIME_SERIES_COLLECTION',
                    data: {
                        stateToMerge: {},
                        timeSeries: {
                            ts1: {
                                variable: 'varId2',
                                points: [1, 2]
                            }
                        },
                        variables: {
                            'varId2': {
                                oid: 'varId2',
                                variableCode: {
                                    value: 2
                                }
                            }
                        }
                    }
                }
            )).toEqual({
                stateToMerge: {},
                timeSeries: {
                    ts: {
                        variable: 'varId',
                        points: [1]
                    },
                    ts1: {
                        variable: 'varId2',
                        points: [1, 2]
                    }

                },
                variables: {
                    'varId': {
                        oid: 'varId',
                        variableCode: {
                            value: 1
                        }
                    },
                    'varId2': {
                        oid: 'varId2',
                        variableCode: {
                            value: 2
                        }
                    }
                }
            });
        });
    });

    describe('RESET_TIME_SERIES', () => {
        it('If series is already empty will return an object with a requests object the key set to the empty object and an empty timeSeries property', () => {
            expect(seriesReducer({}, {
                type: 'RESET_TIME_SERIES',
                key: 'previous'
            })).toEqual({
                timeSeries: {},
                requests: {
                    previous: {}
                }
            });
        });

        it('If series contains a time series the series with the key is reset', () => {
            expect(seriesReducer({
                timeSeries: {
                    ts: {
                        variable: 'varId',
                        tsKey: 'current',
                        points: [1]
                    },
                    ts1: {
                        variable: 'varId2',
                        tsKey: 'compare',
                        points: [1, 2]
                    }
                },
                requests: {
                    current: {
                        queryInfo: 'current'
                    },
                    compare: {
                        queryInfo: 'compare'
                    }
                }
            }, {
                type: 'RESET_TIME_SERIES',
                key: 'compare'
            })).toEqual({
                timeSeries: {
                    ts: {
                        variable: 'varId',
                        tsKey: 'current',
                        points: [1]
                    }
                },
                requests: {
                    compare: {},
                    current: {
                        queryInfo: 'current'
                    }
                }
            });
        });
    });

    describe('LOCATION_IANA_TIME_ZONE_SET', () => {

        it('should add the time zome', () => {
            expect(seriesReducer({}, {
                type: 'LOCATION_IANA_TIME_ZONE_SET',
                ianaTimeZone: 'America/Juneau'
            })).toEqual({
                ianaTimeZone: 'America/Juneau'
            });
        });
    });
});
