import { select } from 'd3-selection';
import { provide } from '../../lib/redux';
import { Actions, configureStore } from '../../store';
import { createTooltipText, createTooltipFocus, tooltipPointsSelector } from './tooltip';


describe('Hydrograph tooltip module', () => {

    let data = [12, 13, 14, 15, 16].map(hour => {
        return {
            dateTime: new Date(`2018-01-03T${hour}:00:00.000Z`).getTime(),
            qualifiers: ['P'],
            value: hour
        };
    });
    const maskedData = [
        {
            dateTime: new Date('2018-01-03T17:00:00.000Z').getTime(),
            qualifiers: ['Fld', 'P'],
            value: null
        },
        {
            dateTime: new Date('2018-01-03T18:00:00.000Z').getTime(),
            qualifiers: ['Mnt', 'P'],
            value: null
        }

    ];
    data = data.concat(maskedData);

    const testState = {
        series: {
            timeSeries: {
                '00060:current': {
                    points: data,
                    tsKey: 'current:P7D',
                    variable: '00060id'
                },
                '00060:compare': {
                    points: data,
                    tsKey: 'compare:P7D',
                    variable: '00060id'
                },
                '00010:current': {
                    points: data,
                    tsKey: 'current:P7D',
                    variable: '00010id'
                },
                '00010:compare': {
                    points: data,
                    tsKey: 'compare:P7D',
                    variable: '00010id'
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
            variables: {
                '00060id': {
                    oid: '00060id',
                    variableCode: {
                        value: '00060'
                    },
                    unit: {
                        unitCode: 'ft3/s'
                    }
                },
                '00010id': {
                    oid: '00010id',
                    variableCode: {
                        value: '00010'
                    },
                    unit: {
                        unitCode: 'deg C'
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
                                start: new Date('2018-01-03T12:00:00.000Z').getTime(),
                                end: new Date('2018-01-03T16:00:00.000Z').getTime()
                            }
                        }
                    }
                },
                'compare:P7D': {
                    notes: {
                        'filter:timeRange': {
                            mode: 'RANGE',
                            interval: {
                                start: new Date('2018-01-03T12:00:00.000Z').getTime(),
                                end: new Date('2018-01-03T16:00:00.000Z').getTime()
                            }
                        }
                    }
                }
            },
            qualifiers: {
                'P': {
                    qualifierCode: 'P',
                    qualifierDescription: 'Provisional data subject to revision.',
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
        timeSeriesState: {
            showSeries: {
                current: true,
                compare: true
            },
            currentVariableID: '00060id',
            currentDateRange: 'P7D'
        }
    };

    describe('tooltipPointsSelector', () => {
        const id = (val) => val;

        it('should return the requested time series focus time', () => {
            expect(tooltipPointsSelector('current').resultFunc(id, id, {
                '00060:current': {
                    dateTime: '1date',
                    value: 1
                },
                '00060:compare': {
                    dateTime: '2date',
                    value: 2
                }
            })).toEqual([{
                x: '1date',
                y: 1,
                tsID: '00060:current'
            }, {
                x: '2date',
                y: 2,
                tsID: '00060:compare'
            }]);
        });

        it('should exclude values that are infinite', () => {
            expect(tooltipPointsSelector('current').resultFunc(id, id, {
                '00060:current': {
                    dateTime: '1date',
                    value: Infinity
                },
                '00060:compare': {
                    dateTime: '2date',
                    value: 2
                }
            })).toEqual([{
                x: '2date',
                y: 2,
                tsID: '00060:compare'
            }]);
        });
    });

    describe('createTooltipText', () => {
        let div;
        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        it('Creates the container for tooltips', () => {
            let store = configureStore({
                timeSeriesState: {
                    cursorOffset: null,
                    showSeries: {
                        current: true
                    }
                }
            });

            div.call(provide(store))
                .call(createTooltipText);

            const textGroup = div.selectAll('.tooltip-text-group');
            expect(textGroup.size()).toBe(1);
        });

        it('Creates the text elements with the label for the focus times', () => {
            let store = configureStore(Object.assign({}, testState, {
                timeSeriesState: Object.assign({}, testState.timeSeriesState, {
                    cursorOffset: 2 * 60 * 60 * 1000
                })
            }));

            div.call(provide(store))
                .call(createTooltipText);

            let value = div.select('.current-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('14 ft3/s');
            value = div.select('.compare-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('14 ft3/s');
        });

        it('Creates the text elements with the label for the focus times when there is a second axis', () => {
            let store = configureStore(Object.assign({}, testState, {
                timeSeriesState: Object.assign({}, testState.timeSeriesState, {
                    cursorOffset: 2 * 60 * 60 * 1000,
                    currentVariableID: '00010id'
                })
            }));

            div.call(provide(store))
                .call(createTooltipText);

            let value = div.select('.current-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('14 deg C (57.2 deg F)');
            value = div.select('.compare-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('14 deg C (57.2 deg F)');
        });

        it('Text contents are updated when the store is provided with new focus times', () => {
            let store = configureStore(Object.assign({}, testState, {
                timeSeriesState: Object.assign({}, testState.timeSeriesState, {
                    cursorOffset: 1
                })
            }));

            div.call(provide(store))
                .call(createTooltipText);

            let value = div.select('.current-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('12 ft3/s');
            store.dispatch(Actions.setCursorOffset(3 * 60 * 60 * 1000));

            value = div.select('.current-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('15 ft3/s');

            value = div.select('.compare-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('15 ft3/s');
        });

        it('Shows the qualifier text if focus is near masked data points', () => {
            let store = configureStore(Object.assign({}, testState, {
                timeSeriesState: Object.assign({}, testState.timeSeriesState, {
                    cursorOffset: 1
                })
            }));

            div.call(provide(store))
                .call(createTooltipText);
            store.dispatch(Actions.setCursorOffset(299 * 60 * 1000));  // 2018-01-03T16:59:00.000Z

            expect(div.select('.current-tooltip-text').text()).toContain('Flood');
        });

        it('Creates the correct text for values of zero', () => {
            const zeroData = [12, 13, 14, 15, 16].map(hour => {
                return {
                    dateTime: new Date(`2018-01-03T${hour}:00:00.000Z`).getTime(),
                    qualifiers: ['P'],
                    value: 0
                };
            });
            let store = configureStore(Object.assign({}, testState, {
                series: Object.assign({}, testState.series, {
                    timeSeries: Object.assign({}, testState.series.timeSeries, {
                        '00060:current': Object.assign({}, testState.series.timeSeries['00060:current'], {
                            points: zeroData
                        })
                    })
                }),
                timeSeriesState: Object.assign({}, testState.timeSeriesState, {
                    cursorOffset: 10
                })
            }));
            div.call(provide(store))
                .call(createTooltipText);
            store.dispatch(Actions.setCursorOffset(119 * 60 * 1000));
            let value = div.select('.current-tooltip-text').text().split(' - ')[0];

            expect(value).toBe('0 ft3/s');
        });
    });

    describe('createTooltipFocus', () => {
        let svg, currentTsData, compareTsData;
        beforeEach(() => {
            svg = select('body').append('svg');

            currentTsData = data;
            compareTsData = [12, 13, 14, 15, 16].map(hour => {
                return {
                    dateTime: new Date(`2017-01-03T${hour}:00:00.000Z`).getTime(),
                    value: hour + 1
                };
            });
        });

        afterEach(() => {
            svg.remove();
        });

        it('Creates focus lines and focus circles when cursor not set', () => {
            let store = configureStore(Object.assign({}, testState, {
                series: Object.assign({}, testState.series, {
                    timeSeries: Object.assign({}, testState.series.timeSeries, {
                        '00060:current': {
                            points: currentTsData,
                            tsKey: 'current:P7D',
                            variable: '00060id'
                        },
                        '00060:compare': {
                            points: compareTsData,
                            tsKey: 'compare:P7D',
                            variable: '00060id'
                        }
                    })
                }),
                timeSeriesState: Object.assign({}, testState.timeSeriesState, {
                    cursorOffset: null
                })
            }));

            svg.call(provide(store)).
                call(createTooltipFocus);

            expect(svg.selectAll('.focus-line').size()).toBe(1);
            expect(svg.selectAll('circle').size()).toBe(2);
            expect(svg.select('.focus').size()).toBe(1);
        });

        it('Focus circles and line are displayed if cursor is set', () => {
            let store = configureStore(Object.assign({}, testState, {
                series: Object.assign({}, testState.series, {
                    timeSeries: Object.assign({}, testState.series.timeSeries, {
                        '00060:current': {
                            points: currentTsData,
                            tsKey: 'current:P7D',
                            variable: '00060id'
                        },
                        '00060:compare': {
                            points: compareTsData,
                            tsKey: 'compare:P7D',
                            variable: '00060id'
                        }
                    })
                }),
                timeSeriesState: Object.assign({}, testState.timeSeriesState, {
                    cursorOffset: 39 * 60 * 1000
                })
            }));

            svg.call(provide(store)).
                call(createTooltipFocus);

            expect(svg.select('.focus:first-child').style('display')).not.toBe('none');
            expect(svg.select('.focus:nth-child(2)').style('display')).not.toBe('none');
        });
    });
});
