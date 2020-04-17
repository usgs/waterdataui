import {
    hasTimeSeriesWithPoints, isVisibleSelector, yLabelSelector, titleSelector,
    descriptionSelector, tsTimeZoneSelector, secondaryYLabelSelector} from './time-series';


const TEST_DATA = {
    ianaTimeZone: 'America/Chicago',
    series: {
        timeSeries: {
            '00060': {
                tsKey: 'current:P7D',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807197',
                method: 69929,
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: null,
                    qualifiers: ['P', 'ICE'],
                    approved: false,
                    estimated: false
                }, {
                    value: null,
                    qualifiers: ['P', 'FLD'],
                    approved: false,
                    estimated: false
                }]
            },
            '00010': {
                tsKey: 'compare:P7D',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807196',
                method: 69931,
                points: [{
                    value: 1,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 2,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 3,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            },
            '00010:2': {
                tsKey: 'current:P7D',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807196',
                method: 69930,
                points: [{
                    value: 1,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 2,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 3,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            },
            '00011': {
                tsKey: 'compare:P7D',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807195',
                method: 69929,
                points: [{
                    value: 68,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 70,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: 77,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }]
            },
            '00060:P30D': {
                tsKey: 'current:P30D:00060',
                startTime: 1520351100000,
                endTime: 1520948700000,
                variable: '45807197',
                method: 69929,
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }, {
                    value: null,
                    qualifiers: ['P', 'ICE'],
                    approved: false,
                    estimated: false
                }, {
                    value: null,
                    qualifiers: ['P', 'FLD'],
                    approved: false,
                    estimated: false
                }]
            }
        },
        timeSeriesCollections: {
            'coll1': {
                variable: 45807197,
                timeSeries: ['00060']
            }
        },
        requests: {
            'current:P7D': {
                timeSeriesCollections: ['coll1']
            },
            'current:P30D:00060': {}
        },
        variables: {
            '45807197': {
                variableCode: {
                    value: '00060'
                },
                variableName: 'Streamflow',
                variableDescription: 'Discharge, cubic feet per second',
                oid: '45807197'
            },
            '45807196': {
                variableCode: {
                    value: '00010'
                },
                variableName: 'Temperature, water, degrees Celsius',
                variableDescription: 'Water Temperature in Celsius',
                oid: '45807196'
            },
            '45807195': {
                variableCode: {
                    value: '00011'
                },
                variableName: 'Temperature, water, degrees Fahrenheit',
                variableDescription: 'Water Temperature in Fahrenheit',
                oid: '45807195'
            },
            '55807196' : {
                variableCode: {
                    value: '11111'
                },
                variableName: 'My variable',
                variableDescription: 'My awesome variable',
                oid: '55807196'
            }
        },
        methods: {
            69329: {
                methodDescription: '',
                methodID: 69928
            },
            69330: {
                methodDescription: '4.1 ft from riverbed (middle)',
                methodID: 69930
            },
            69331: {
                methodDescription: '1.0 ft from riverbed (bottom)',
                methodID: 69931
            }
        },
        queryInfo: {
            'current:P7D': {
                notes: {
                    requestDT: 1483994767572,
                    'filter:timeRange': {
                        mode: 'PERIOD',
                        periodDays: 7,
                        modifiedSince: null
                    }
                }
            },
            'current:P30D:00060': {
                notes: {
                    requestDT: 1483994767572,
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {
                            start: 1483941600000,
                            end: 1486533600000
                        },
                        modifiedSince: null
                    }
                }
            }
        }
    },
    timeSeriesState: {
        currentVariableID: '45807197',
        currentDateRange: 'P7D'
    }
};

describe('TimeSeries module', () => {

    describe('hasTimeSeriesWithPoints', () => {
        it('Returns true if the time series for tsKey and period have non zero points', () => {
            expect(hasTimeSeriesWithPoints('current')(TEST_DATA)).toBe(true);
            expect(hasTimeSeriesWithPoints('current', 'P30D')(TEST_DATA)).toBe(true);
        });
        it('Returns false if the times series for tsKey and period have zero time series', () => {
            expect(hasTimeSeriesWithPoints('compare', 'P30D')(TEST_DATA)).toBe(false);
        });
    });

    describe('isVisibleSelector', () => {
        it('Returns whether the time series is visible', () => {
            const store = {
                timeSeriesState: {
                    showSeries: {
                        'current': true,
                        'compare': false,
                        'median': true
                    }
                }
            };

            expect(isVisibleSelector('current')(store)).toBe(true);
            expect(isVisibleSelector('compare')(store)).toBe(false);
            expect(isVisibleSelector('median')(store)).toBe(true);
        });
    });

    describe('yLabelSelector', () => {
        it('Returns string to be used for labeling the y axis', () => {
            expect(yLabelSelector(TEST_DATA)).toBe('Discharge, cubic feet per second');
        });

        it('Returns empty string if no variable selected', () => {
            expect(yLabelSelector({
                ...TEST_DATA,
                timeSeriesState: {
                    ...TEST_DATA.timeSeriesState,
                    currentVariableID: null
                }
            })).toBe('');
        });
    });

    describe('secondaryYLabelSelector', () => {
        it('returns a secondary label when a celsius parameter is selected', () => {
             expect(secondaryYLabelSelector({
                 ...TEST_DATA,
                 timeSeriesState: {
                     ...TEST_DATA.timeSeriesState,
                     currentVariableID: '45807196'
                 }
             })).toEqual('degrees Fahrenheit');
        });

        it('returns a secondary label when a fahrenheit parameter is selected', () => {
             expect(secondaryYLabelSelector({
                 ...TEST_DATA,
                 timeSeriesState: {
                     ...TEST_DATA.timeSeriesState,
                     currentVariableID: '45807195'
                 }
             })).toEqual('degrees Celsius');
        });

        it('does not return a secondary when a parameter when a non-temperature parameter is selected', () => {
             expect(secondaryYLabelSelector(TEST_DATA)).toBeNull();
        });
    });

    describe('titleSelector', () => {
        it('Returns the string to used for graph title', () => {
            expect(titleSelector(TEST_DATA)).toBe('Streamflow');
        });
        it('Returns the title string with the method description appended', () => {
            expect(titleSelector({
                ...TEST_DATA,
                timeSeriesState: {
                    ...TEST_DATA.timeSeriesState,
                    currentMethodID: 69330
                }
            })).toBe('Streamflow' + ', ' + '4.1 ft from riverbed (middle)');
        });
        it('Returns empty string if no variable selected', () => {
            expect(titleSelector({
                ...TEST_DATA,
                timeSeriesState: {
                    ...TEST_DATA.timeSeriesState,
                    currentVariableID: null
                }
            })).toBe('');
        });
    });

    describe('descriptionSelector', () => {
        it('Returns a description with the date for the current times series', () => {
            const result = descriptionSelector(TEST_DATA);

            expect(result).toContain('Discharge, cubic feet per second');
            expect(result).toContain('1/2/2017');
            expect(result).toContain('1/9/2017');
        });
    });

    describe('tsTimeZoneSelector', () => {

        it('Returns local if series is empty', () => {
            const result = tsTimeZoneSelector({
                series: {}
            });
            expect(result).toEqual('local');
        });

        it('Returns local if timezone is null', () => {
            const result = tsTimeZoneSelector({
                ianaTimeZone: null
            });
            expect(result).toEqual('local');
        });

        it('Returns the IANA timezone NWIS and IANA agree', () => {
            const result = tsTimeZoneSelector({
                ianaTimeZone: 'America/New_York'
            });
            expect(result).toEqual('America/New_York');
        });
    });
});
