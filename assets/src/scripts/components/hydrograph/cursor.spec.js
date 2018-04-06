const { select } = require('d3-selection');

const { configureStore } = require('../../store');
const { provide } = require('../../lib/redux');

const { cursorSlider, getNearestTime, tsCursorPointsSelector } = require('./cursor');




let DATA = [12, 13, 14, 15, 16].map(hour => {
    return {
        dateTime: new Date(`2018-01-03T${hour}:00:00.000Z`),
        qualifiers: ['P'],
        value: hour
    };
});
DATA = DATA.concat([
    {
        dateTime: new Date('2018-01-03T17:00:00.000Z'),
        qualifiers: ['Fld', 'P'],
        value: null
    },
    {
        dateTime: new Date('2018-01-03T18:00:00.000Z'),
        qualifiers: ['Mnt', 'P'],
        value: null
    }

]);

const TEST_STATE_THREE_VARS = {
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

const TEST_STATE_ONE_VAR = {
    series: {
        timeSeries: {
            '00060:current': {
                points: DATA,
                tsKey: 'current',
                variable: '00060id'
            },
            '00060:compare': {
                points: DATA,
                tsKey: 'compare',
                variable: '00060id'
            }
        },
        timeSeriesCollections: {
            'current': {
                variable: '00060id',
                timeSeries: ['00060:current']
            },
            'compare': {
                variable: '00060id',
                timeSeries: ['00060:compare']
            }
        },
        variables: {
            '00060id': {
                oid: '00060id',
                variableCode: {
                    value: '00060'
                },
                unit: {
                    unitCode: 'ft3/s'
                }
            }
        },
        requests: {
            'current': {
                timeSeriesCollections: ['current']
            },
            'compare': {
                timeSeriesCollections: ['compare']
            }
        },
        queryInfo: {
            current: {
                notes: {
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {
                            start: new Date('2018-01-03T12:00:00.000Z'),
                            end: new Date('2018-01-03T16:00:00.000Z')
                        }
                    }
                }
            },
            compare: {
                notes: {
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {
                            start: new Date('2018-01-03T12:00:00.000Z'),
                            end: new Date('2018-01-03T16:00:00.000Z')
                        }
                    }
                }
            }
        },
        qualifiers: {
            'P': {
                qualifierCode: 'P',
                qualifierDescription: 'Provisional DATA subject to revision.',
                qualifierID: 0,
                network: 'NWIS',
                vocabulary: 'uv_rmk_cd'
            },
            'Fld': {
                qualifierCode: 'Fld',
                qualifierDescription: 'Flood',
                qualifierId: 0,
                network: 'NWIS',
                vocabulary: 'uv_rmk_cd'
            },
            'Mnt': {
                qualifierCode: 'Mnt',
                qualifierDescription: 'Maintenance',
                qualifierId: 0,
                network: 'NWIS',
                vocabulary: 'uv_rmk_cd'
            }
        }
    },
    showSeries: {
        current: true,
        compare: true
    },
    currentVariableID: '00060id',
    cursorOffset: null
};

describe('Cursor module', () => {
    describe('getNearestTime', () => {
        it('Return null if the length of the DATA array is less than two', function() {
            expect(getNearestTime([], DATA[0].dateTime)).toBeNull();
            expect(getNearestTime([DATA[1]], DATA[0].dateTime)).toBeNull();
        });

        it('return correct DATA points via getNearestTime' , () => {
            // Check each date with the given offset against the hourly-spaced
            // test DATA.
            function expectOffset(offset, side) {
                for (let [index, datum] of DATA.entries()) {
                    let expected;
                    if (side === 'left' || index === DATA.length - 1) {
                        expected = {datum, index};
                    } else {
                        expected = {datum: DATA[index + 1], index: index + 1};
                    }
                    let time = new Date(datum.dateTime.getTime() + offset);
                    let returned = getNearestTime(DATA, time);

                    expect(returned.datum.dateTime).toBe(expected.datum.dateTime);
                    expect(returned.datum.index).toBe(expected.datum.index);
                }
            }

            let hour = 3600000;  // 1 hour in milliseconds

            // Check each date against an offset from itself.
            expectOffset(0, 'left');
            expectOffset(1, 'left');
            expectOffset(hour / 2 - 1, 'left');
            expectOffset(hour / 2, 'left');
            expectOffset(hour / 2 + 1, 'right');
            expectOffset(hour - 1, 'right');
        });
    });

    describe('cursorSlider', () => {
        let div;
        let store;

        beforeEach(() => {
            store = configureStore(TEST_STATE_ONE_VAR);
            div = select('body')
                .append('div')
                .call(provide(store));
            cursorSlider(div);
        });

        afterEach(() => {
            div.remove();
        });

        it('becomes active on focus', () => {
            const input = div.select('input');

            expect(input.classed('active')).toBe(false);
            expect(store.getState().cursorOffset).toBe(null);
            div.select('input').dispatch('focus');
            expect(input.classed('active')).toBe(true);
            expect(store.getState().cursorOffset).not.toBe(null);
            div.select('input').dispatch('blur');
            expect(input.classed('active')).toBe(false);
            expect(store.getState().cursorOffset).toBe(null);
        });
    });

    describe('tsCursorPointsSelector', () => {

        it('Should return empty object if the focus time for the time series is null', function() {
            expect(tsCursorPointsSelector('compare')(TEST_STATE_ONE_VAR)).toEqual({});
            expect(tsCursorPointsSelector('current')(TEST_STATE_ONE_VAR)).toEqual({});
        });

        it('Should return the nearest datum for the selected time series', function() {
            let state = {
                ...TEST_STATE_ONE_VAR,
                cursorOffset: 149 * 60 * 1000
            };

            expect(tsCursorPointsSelector('current')(state)['00060:current'].value).toEqual(14);
            expect(tsCursorPointsSelector('compare')(state)['00060:compare'].value).toEqual(14);
        });

        it('Selects the nearest point for the current variable streamflow', () => {
            const newState = {
                ...TEST_STATE_THREE_VARS,
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
                ...TEST_STATE_THREE_VARS,
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
