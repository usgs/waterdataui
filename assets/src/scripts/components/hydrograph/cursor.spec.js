import { select } from 'd3-selection';
import { Actions, configureStore } from '../../store';
import { provide } from '../../lib/redux';
import { cursorSlider, getNearestTime, tsCursorPointsSelector, cursorOffsetSelector } from './cursor';




let DATA = [12, 13, 14, 15, 16].map(hour => {
    return {
        dateTime: new Date(`2018-01-03T${hour}:00:00.000Z`).getTime(),
        qualifiers: ['P'],
        value: hour
    };
});
DATA = DATA.concat([
    {
        dateTime: 1514998800000,
        qualifiers: ['Fld', 'P'],
        value: null
    },
    {
        dateTime: 1515002400000,
        qualifiers: ['Mnt', 'P'],
        value: null
    }

]);

const TEST_STATE_THREE_VARS = {
    series: {
        queryInfo: {
            'current:P7D': {
                notes: {
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {
                            start: 1522346400000,
                            end: 1522349100000

                        }
                    }
                }
            },
            'compare:P7D': {
                notes: {
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {
                            start: 1522346400000,
                            end: 1522349100000
                        }
                    }
                }
            }
        },
        methods: {
            69927: {
                methodDescription: '',
                methodID: 69927
            },
            69928: {
                methodDescription: '',
                methodID: 69928
            },
            69929: {
                methodDescription: '',
                methodID: 69929
            },
            69930: {
                methodDescription: '',
                methodID: 69930
            }
        },
        timeSeries: {
            '69928:current:P7D': {
                tsKey: 'current:P7D',
                startTime: 1520351100000,
                endTime: 1520955900000,
                variable: '45807197',
                method: 69928,
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    dateTime: 1522346400000
                }, {
                    value: null,
                    qualifiers: ['P', 'ICE'],
                    dateTime: 1522347300000
                }, {
                    value: null,
                    qualifiers: ['P', 'FLD'],
                    dateTime: 1522348200000
                }]
            },
            '69927:current:P7D': {
                tsKey: 'current:P7D',
                startTime: 1520351100000,
                endTime: 1520955900000,
                variable: '45807196',
                method: 69927,
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    dateTime: 1522346400000
                }, {
                    value: 11,
                    qualifiers: ['P', 'ICE'],
                    dateTime: 1522347300000
                }, {
                    value: 12,
                    qualifiers: ['P', 'FLD'],
                    dateTime: 1522348200000
                }]
            },
            '69929:current:P7D': {
                tsKey: 'current:P7D',
                startTime: 1520351100000,
                endTime: 1520955900000,
                variable: '45807196',
                method: 69929,
                points: [{
                    value: 1,
                    qualifiers: ['P'],
                    dateTime: 1522346400000
                }, {
                    value: 2,
                    qualifiers: ['P'],
                    dateTime: 1522347300000
                }, {
                    value: 3,
                    qualifiers: ['P'],
                    dateTime: 1522348200000
                }]
            },
            '69930:current:P7D': {
                tsKey: 'current:P7D',
                startTime: 1488815100000,
                endTime: 1489419900000,
                method: 69930,
                variable: '45807140',
                points: [{
                    value: 0,
                    qualifiers: ['P'],
                    dateTime: 1522346400000
                }, {
                    value: 0.01,
                    qualifiers: ['P'],
                    dateTime: 1522347300000
                }, {
                    value: 0.02,
                    qualifiers: ['P'],
                    dateTime: 1522348200000
                }, {
                    value: 0.03,
                    qualifiers: ['P'],
                    dateTime: 1522349100000
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
    statisticsData: {},
    timeSeriesState: {
        showSeries: {
            current: true,
            compare: false,
            median: false
        },
        currentVariableID: '45807197',
        currentMethodID: 69928,
        currentDateRange: 'P7D',
        audiblePlayId: null
    },
    ui: {
        windowWidth: 1024,
        width: 800
    }
};

const TEST_STATE_ONE_VAR = {
    series: {
        timeSeries: {
            '69928:current:P7D': {
                points: DATA,
                tsKey: 'current:P7D',
                variable: '00060id',
                methodID: 69928
            },
            '69928:compare:P7D': {
                points: DATA,
                tsKey: 'compare:P7D',
                variable: '00060id',
                methodID: 69928
            }
        },
        timeSeriesCollections: {
            'current:P7D': {
                variable: '00060id',
                timeSeries: ['00060:current']
            },
            'compare:P7D': {
                variable: '00060id',
                timeSeries: ['00060:compare']
            }
        },
        methods: {
            69928: {
                methodDescription: '',
                methodID: 69928
            },
            69929: {
                methodDescription: '',
                methodID: 69929
            },
            69930: {
                methodDescription: '',
                methodID: 69930
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
            'current:P7D': {
                timeSeriesCollections: ['current']
            },
            'compare:P7D': {
                timeSeriesCollections: ['compare']
            }
        },
        queryInfo: {
            'current:P7D': {
                notes: {
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {
                            start: 1514980800000,
                            end: 1514995200000
                        }
                    }
                }
            },
            'compare:P7D': {
                notes: {
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {
                            start: 1514980800000,
                            end: 1514995200000
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
    statisticsData: {},
    timeSeriesState: {
        showSeries: {
            current: true,
            compare: true
        },
        currentVariableID: '00060id',
        currentMethodID: 69928,
        currentDateRange: 'P7D',
        cursorOffset: null
    },
    ui: {
        windowWidth: 1024,
        width: 800
    }
};

describe('Cursor module', () => {
    describe('getNearestTime', () => {
        it('Return null if the DATA array is empty', function() {
            expect(getNearestTime([], DATA[0].dateTime)).toBeNull();
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
                    let time = new Date(datum.dateTime + offset);
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

        it('is active irrespective of focus', () => {
            const input = div.select('input');

            expect(input.classed('active')).toBe(true);
            expect(store.getState().timeSeriesState.cursorOffset).toBe(null);
            div.select('input').dispatch('focus');
            expect(input.classed('active')).toBe(true);
            expect(store.getState().timeSeriesState.cursorOffset).not.toBe(null);
            div.select('input').dispatch('blur');
            expect(input.classed('active')).toBe(true);
            expect(store.getState().timeSeriesState.cursorOffset).toBe(null);
        });
    });

    describe('tsCursorPointsSelector', () => {

        it('Should return last time with non-masked value if the cursor offset is null', function() {
            expect(tsCursorPointsSelector('compare')(TEST_STATE_ONE_VAR)).toEqual({
                '69928:compare:P7D': {
                    dateTime: 1514995200000,
                    qualifiers: ['P'],
                    value: 16,
                    tsKey: 'compare'
                }
            });
            expect(tsCursorPointsSelector('current')(TEST_STATE_ONE_VAR)).toEqual({
                '69928:current:P7D': {
                    dateTime: 1514995200000,
                    qualifiers: ['P'],
                    value: 16,
                    tsKey: 'current'
                }
            });
        });

        it('Should return the nearest datum for the selected time series', function() {
            let state = {
                ...TEST_STATE_ONE_VAR,
                timeSeriesState: {
                    ...TEST_STATE_ONE_VAR.timeSeriesState,
                    cursorOffset: 149 * 60 * 1000
                }
            };

            expect(tsCursorPointsSelector('current')(state)['69928:current:P7D'].value).toEqual(14);
            expect(tsCursorPointsSelector('compare')(state)['69928:compare:P7D'].value).toEqual(14);
        });

        it('Selects the nearest point for the current variable streamflow', () => {
            const newState = {
                ...TEST_STATE_THREE_VARS,
                timeSeriesState: {
                    ...TEST_STATE_THREE_VARS.timeSeriesState,
                    currentVariableID: '45807196',
                    currentMethodID: 69929,
                    cursorOffset: 16 * 60 * 1000
                }
            };
            expect(tsCursorPointsSelector('current')(newState)).toEqual({
                '69929:current:P7D': {
                    value: 2,
                    qualifiers: ['P'],
                    dateTime: 1522347300000,
                    tsKey: 'current'
                }
            });
        });

        it('Selects the nearest point for current variable precipitation', () => {
            const newState = {
                ...TEST_STATE_THREE_VARS,
                timeSeriesState: {
                    ...TEST_STATE_THREE_VARS.timeSeriesState,
                    currentVariableID: '45807140',
                    currentMethodID: 69930,
                    cursorOffset: 29 * 60 * 1000
                }
            };

            expect(tsCursorPointsSelector('current')(newState)).toEqual({
                '69930:current:P7D': {
                    value: 0.03,
                    qualifiers: ['P'],
                    dateTime: 1522348200000,
                    tsKey: 'current'
                }
            });
        });
    });

    describe('cursorOffsetSelector', () => {
        let store;
        beforeEach(() => {
            store = configureStore(TEST_STATE_ONE_VAR);
        });

        it('returns null when false', () => {
            store.dispatch(Actions.setCursorOffset(false));
            expect(cursorOffsetSelector(store.getState())).toBe(null);
        });

        it('returns last point when null', () => {
            store.dispatch(Actions.setCursorOffset(null));
            const cursorRange = DATA[4].dateTime - DATA[0].dateTime;
            expect(cursorOffsetSelector(store.getState())).toBe(cursorRange);
        });
    });
});
