
const { tsCursorPointsSelector } = require('./cursor');

const TEST_DATA = {
    series: {
        queryInfo: {
            current: {
                notes: {
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {
                            start: new Date('2018-03-29T13:00:00'),
                            end: new Date('2018-03-29T13:45:00')

                        }
                    }
                }
            },
            compare: {
                notes: {
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {
                            start: new Date('2018-03-29T13:00:00'),
                            end: new Date('2018-03-29T13:45:00')
                        }
                    }
                }
            }
        },
        timeSeries: {
            '00060': {
                tsKey: 'current',
                startTime: new Date('2018-03-06T15:45:00.000Z'),
                endTime: new Date('2018-03-13t13:45:00.000Z'),
                variable: '45807197',
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    dateTime: new Date('2018-03-29T13:00:00')
                }, {
                    value: null,
                    qualifiers: ['P', 'ICE'],
                    dateTime: new Date('2018-03-29T13:15:00')
                }, {
                    value: null,
                    qualifiers: ['P', 'FLD'],
                    dateTime: new Date('2018-03-29T13:30:00')
                }]
            },
            '00010': {
                tsKey: 'current',
                startTime: new Date('2017-03-06T15:45:00.000Z'),
                endTime: new Date('2017-03-13t13:45:00.000Z'),
                variable: '45807196',
                points: [{
                    value: 1,
                    qualifiers: ['P'],
                    dateTime: new Date('2018-03-29T13:00:00')
                }, {
                    value: 2,
                    qualifiers: ['P'],
                    dateTime: new Date('2018-03-29T13:15:00')
                }, {
                    value: 3,
                    qualifiers: ['P'],
                    dateTime: new Date('2018-03-29T13:30:00')
                }]
            },
            '00045': {
                tsKey: 'current',
                startTime: new Date('2017-03-06T15:45:00.000Z'),
                endTime: new Date('2017-03-13t13:45:00.000Z'),
                variable: '45807140',
                points: [{
                    value: 0,
                    qualifiers: ['P'],
                    dateTime: new Date('2018-03-29T13:00:00')
                }, {
                    value: 0.01,
                    qualifiers: ['P'],
                    dateTime: new Date('2018-03-29T13:15:00')
                }, {
                    value: 0.02,
                    qualifiers: ['P'],
                    dateTime: new Date('2018-03-29T13:30:00')
                }, {
                    value: 0.03,
                    qualifiers: ['P'],
                    dateTime: new Date('2018-03-29T13:45:00')
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
            current: {
                timeSeriesCollections: ['coll1']
            }
        },
        variables: {
            '45807197': {
                variableCode: {value: '00060'},
                variableName: 'Streamflow',
                variableDescription: 'Discharge, cubic feet per second',
                oid: '45807197'
            },
            '45807196': {
                variableCode: {value: '00010'},
                variableName: 'Gage Height',
                variableDescription: 'Gage Height in feet',
                oid: '45807196'
            },
            '45807140': {
                variableCode: {value: '00045'},
                variableName: 'Precipitation',
                variableDescription: 'Precipitation in inches',
                oid: '45807140'
            }
        }
    },
    showSeries: {
        current: true,
        compare: false,
        median: false
    },
    currentVariableID: '45807197',
    windowWidth: 1024,
    width: 800,
    playId: null
};

fdescribe('cursor module', () => {

    describe('tsCursorPointsSelector', () => {

        it('Selects the nearest point for the current variable streamflow', () => {
            const newState = {
                ...TEST_DATA,
                currentVariableID: '45807196',
                cursorOffset: 16 * 60 * 1000
            };

            expect(tsCursorPointsSelector('current')(newState)).toEqual({
                '00010': {
                    value: 2,
                    qualifiers: ['P'],
                    dateTime: new Date('2018-03-29T13:15:00'),
                    tsKey: 'current'
                }
            });
        });

        it('Selects the nearest point for current variable precipitation', () => {
            const newState = {
                ...TEST_DATA,
                currentVariableID: '45807140',
                cursorOffset: 29 * 60 * 1000
            };

            expect(tsCursorPointsSelector('current')(newState)).toEqual({
                '00045': {
                    value: 0.03,
                    qualifiers: ['P'],
                    dateTime: new Date('2018-03-29T13:30:00'),
                    tsKey: 'current'
                }
            });
        });
    });
});