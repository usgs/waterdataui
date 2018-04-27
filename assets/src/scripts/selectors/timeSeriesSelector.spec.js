const { getVariables, getCurrentVariableID, getCurrentDateRange, getCurrentVariable, getQueryInfo, getCurrentParmCd,
    hasTimeSeries, getCurrentVariableTimeSeriesRequestKey } = require('./timeSeriesSelector');

describe('timeSeriesSelector', () => {
    const TEST_VARS = {
        '45807042': {
            variableCode: {
                'value': '00060'
            }
        },
        '450807142': {
            variableCode: {
                'value': '00010'
            }
        }
    };

    describe('getVariables', () => {
        it('Return null if series is empty', () => {
            expect(getVariables({
                series: {}
            })).toBeNull();
        });

        it('Return the variables if in series', () => {
            expect(getVariables({
                series: {
                    variables: TEST_VARS
                }
            })).toEqual(TEST_VARS);
        });
    });

    describe('getQueryInfo', () => {
        it('Return empty object if series is empty', () => {
            expect(getQueryInfo({
                series: {}
            })).toEqual({});
        });

        it('Return queryinfo is state', () => {
            expect(getQueryInfo({
                series: {
                    queryInfo: {
                        'current:P7D': {
                            queryURL: 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D'
                        }
                    }
                }
            })).toEqual({
                'current:P7D': {
                    queryURL: 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D'
                }
            });
        });
    });

    describe('getCurrentVariableID', () => {
        it('Return the current variable ID', () => {
            expect(getCurrentVariableID({
                timeseriesState: {
                    currentVariableID: '00060'
                }
            })).toEqual('00060');
        });
    });

    describe('getCurrentDateRange', () => {
       it('Return the current date range', () => {
           expect(getCurrentDateRange({
               timeseriesState: {
                   currentDateRange: 'P30D'
               }
           })).toEqual('P30D');
       });
    });

    describe('getCurrentVariable', () => {
        const TEST_STATE = {
            series: {
                variables: TEST_VARS
            },
            timeseriesState: {
                currentVariableID: '45807042'
            }
        };

        it('Return null if no variable is selected', () => {
            expect(getCurrentVariable({
                ...TEST_STATE,
                timeseriesState: {
                    currentVariableID: null
                }
            })).toBeNull();
        });

        it('Return null if no variables are in series', () => {
           expect(getCurrentVariable({
               ...TEST_STATE,
               series: {
                   variables: {}
               }
           })).toBeNull();
           expect(getCurrentVariable({
               ...TEST_STATE,
               series: {}
           })).toBeNull();
        });

        it('Return selected variable', () => {
            expect(getCurrentVariable(TEST_STATE)).toEqual(TEST_VARS['45807042']);
        });
    });

    describe('getCurrentParmCd', () => {
        const TEST_STATE = {
            series: {
                variables: TEST_VARS
            },
            timeseriesState: {
                currentVariableID: '45807042'
            }
        };

        it('Return null if no variable is selected', () => {
            expect(getCurrentParmCd({
                ...TEST_STATE,
                timeseriesState: {
                    currentVariableID: null
                }
            })).toBeNull();
        });

        it('Return null if no variables are in series', () => {
           expect(getCurrentParmCd({
               ...TEST_STATE,
               series: {
                   variables: {}
               }
           })).toBeNull();
           expect(getCurrentParmCd({
               ...TEST_STATE,
               series: {}
           })).toBeNull();
        });

        it('Return selected parm code', () => {
            expect(getCurrentParmCd(TEST_STATE)).toEqual('00060');
        });
    });

    describe('hasTimeSeries', () => {
        const TEST_STATE = {
            series: {
                requests : {
                    'current:P7D': {},
                    'median' : {},
                    'current:P30D:00060': {}
                }
            }
        };

        it('Return false if no requests in series', () => {
            expect(hasTimeSeries('current', 'P7D', '00060')({
                series: {}
            })).toBe(false);
        });

        it('Return false if request is not in state', () => {
            expect(hasTimeSeries('compare:P7D')(TEST_STATE)).toBe(false);
            expect(hasTimeSeries('current:P1Y:00060')(TEST_STATE)).toBe(false);
            expect(hasTimeSeries('current:P30D:00010')(TEST_STATE)).toBe(false);
        });

        it('Return true if request is in state', () => {
            expect(hasTimeSeries('current:P7D')(TEST_STATE)).toBe(true);
            expect(hasTimeSeries('current:P30D:00060')(TEST_STATE)).toBe(true);
        });
    });

    describe('getCurrentVariableTimeseriesRequestKey', () => {
        const TEST_STATE = {
            series: {
                requests : {
                    'current:P7D': {},
                    'median' : {},
                    'current:P30D:00060': {}
                },
                variables: TEST_VARS
            },
            timeseriesState: {
                currentVariableID: '45807042',
                currentDateRange: 'P7D'
            }
        };

        it('Return null if currentVariableID', () => {
            expect(getCurrentVariableTimeSeriesRequestKey('current', 'P30D')({
                ...TEST_STATE,
                timeseriesState: {
                    ...TEST_STATE.timeseriesState,
                    currentVariableID: null
                }
            })).toBeNull();
        });
        it('Return null if period is not specified and current date range is not set', () => {
            expect(getCurrentVariableTimeSeriesRequestKey('current')({
                ...TEST_STATE,
                timeseriesState: {
                    ...TEST_STATE.timeseriesState,
                    currentDateRange: null
                }
            })).toBeNull();
        });

        it('Return the ts request key to use for the currently selected variable and date range', () => {
            expect(getCurrentVariableTimeSeriesRequestKey('current')(TEST_STATE)).toEqual('current:P7D');
            expect(getCurrentVariableTimeSeriesRequestKey('current')({
                ...TEST_STATE,
                timeseriesState: {
                    ...TEST_STATE.timeseriesState,
                    currentDateRange: 'P30D'
                }
            })).toEqual('current:P30D:00060');
        });
    });
});