
const { seriesReducer } = require('./seriesReducer');

describe('seriesReducer', () => {

    describe('ADD_TIMESERIES_COLLECTION action', () => {
        it('Should add the timeseries collection to the series as is if series is empty', () => {
            expect(seriesReducer({}, {
                type: 'ADD_TIMESERIES_COLLECTION',
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
                    type: 'ADD_TIMESERIES_COLLECTION',
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

    describe('RESET_TIMESERIES', () => {
        it('If series is already empty will return an object with a requests object the key set to the empty object and an empty timeSeries property', () => {
            expect(seriesReducer({}, {
                type: 'RESET_TIMESERIES',
                key: 'previous'
            })).toEqual({
                timeSeries: {},
                requests: {
                    previous: {}
                }
            });
        });

        it('If series contains a timeseries the series with the key is reset', () => {
            const result = seriesReducer({
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
                type: 'RESET_TIMESERIES',
                key: 'compare'
            });
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
                type: 'RESET_TIMESERIES',
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
});