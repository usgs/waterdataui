
const { select } = require('d3-selection');
const proxyquire = require('proxyquireify')(require);

const { provide } = require('../../lib/redux');
const { Actions, configureStore } = require('../../store');
const { createTooltipText, createTooltipFocus } = require('./tooltip');


describe('Hydrograph tooltip module', () => {

    let data = [12, 13, 14, 15, 16].map(hour => {
        return {
            dateTime: new Date(`2018-01-03T${hour}:00:00.000Z`),
            qualifiers: ['P'],
            value: hour
        };
    });
    const maskedData = [
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

    ];
    data = data.concat(maskedData);

    const testState = {
        series: {
            timeSeries: {
                '00060:current': {
                    points: data,
                    tsKey: 'current',
                    variable: '00060id'
                },
                '00060:compare': {
                    points: data,
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
        timeseriesState: {
            showSeries: {
                current: true,
                compare: true
            },
            currentVariableID: '00060id'
        }
    };

    describe('tooltipPointsSelector', () => {
        const finiteData = {
            './cursor': {
                tsCursorPointsSelector: () => () => {
                    return {
                        '00060:current': {
                            dateTime: '1date',
                            value: 1
                        },
                        '00060:compare': {
                            dateTime: '2date',
                            value: 2
                        }
                    };
                }
            },
            './scales': {
                xScaleSelector: () => () => (val) => val,
                yScaleSelector: () => (val) => val
            }
        };
        const infiniteData = {
            './cursor': {
                tsCursorPointsSelector: () => () => {
                    return {
                        '00060:current': {
                            dateTime: '1date',
                            value: Infinity
                        },
                        '00060:compare': {
                            dateTime: '2date',
                            value: 2
                        }
                    };
                }
            },
            './scales': {
                xScaleSelector: () => () => (val) => val,
                yScaleSelector: () => (val) => val
            }
        };

        it('should return the requested time series focus time', () => {
            let tooltip = proxyquire('./tooltip', finiteData);
            expect(tooltip.tooltipPointsSelector('current')({})).toEqual([{
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
            let tooltip = proxyquire('./tooltip', infiniteData);
            expect(tooltip.tooltipPointsSelector('current')({})).toEqual([{
                x: '2date',
                y: 2,
                tsID: '00060:compare'
            }]);
        });
    });

    describe('createTooltipText', () => {
        let svg;
        beforeEach(() => {
            svg = select('body').append('svg');
        });

        afterEach(() => {
            svg.remove();
        });

        it('Creates the container for tooltips', () => {
            let store = configureStore({
                timeseriesState: {
                    cursorOffset: null,
                    showSeries: {
                        current: true
                    }
                }
            });

            svg.call(provide(store))
                .call(createTooltipText);

            const textGroup = svg.selectAll('.tooltip-text-group');
            expect(textGroup.size()).toBe(1);
        });

        it('Creates the text elements with the label for the focus times', () => {
            let store = configureStore(Object.assign({}, testState, {
                timeseriesState: Object.assign({}, testState.timeseriesState, {
                    cursorOffset: 2 * 60 * 60 * 1000
                })
            }));

            svg.call(provide(store))
                .call(createTooltipText);

            let value = svg.select('.current-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('14 ft3/s');
            value = svg.select('.compare-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('14 ft3/s');
        });

        it('Text contents are updated when the store is provided with new focus times', () => {
            let store = configureStore(Object.assign({}, testState, {
                timeseriesState: Object.assign({}, testState.timeseriesState, {
                    cursorOffset: 1
                })
            }));

            svg.call(provide(store))
                .call(createTooltipText);

            let value = svg.select('.current-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('12 ft3/s');
            store.dispatch(Actions.setCursorOffset(3 * 60 * 60 * 1000));

            value = svg.select('.current-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('15 ft3/s');

            value = svg.select('.compare-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('15 ft3/s');
        });

        it('Shows the qualifier text if focus is near masked data points', () => {
            let store = configureStore(Object.assign({}, testState, {
                timeseriesState: Object.assign({}, testState.timeseriesState, {
                    cursorOffset: 1
                })
            }));

            svg.call(provide(store))
                .call(createTooltipText);
            store.dispatch(Actions.setCursorOffset(299 * 60 * 1000));  // 2018-01-03T16:59:00.000Z

            expect(svg.select('.current-tooltip-text').text()).toContain('Flood');
        });

        it('Creates the correct text for values of zero', () => {
            const zeroData = [12, 13, 14, 15, 16].map(hour => {
                return {
                    dateTime: new Date(`2018-01-03T${hour}:00:00.000Z`),
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
                timeseriesState: Object.assign({}, testState.timeseriesState, {
                    cursorOffset: 10
                })
            }));
            svg.call(provide(store))
                .call(createTooltipText);
            store.dispatch(Actions.setCursorOffset(119 * 60 * 1000));
            let value = svg.select('.current-tooltip-text').text().split(' - ')[0];

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
                    dateTime: new Date(`2017-01-03T${hour}:00:00.000Z`),
                    value: hour + 1
                };
            });
        });

        afterEach(() => {
            svg.remove();
        });

        it('Creates focus lines but has no focus circles when cursor not set', () => {
            let store = configureStore(Object.assign({}, testState, {
                series: Object.assign({}, testState.series, {
                    timeSeries: Object.assign({}, testState.series.timeSeries, {
                        '00060:current': {
                            points: currentTsData,
                            tsKey: 'current',
                            variable: '00060id'
                        },
                        '00060:compare': {
                            points: compareTsData,
                            tsKey: 'compare',
                            variable: '00060id'
                        }
                    })
                }),
                timeseriesState: Object.assign({}, testState.timeseriesState, {
                    cursorOffset: null
                })
            }));

            svg.call(provide(store)).
                call(createTooltipFocus);

            expect(svg.selectAll('.focus-line').size()).toBe(1);
            expect(svg.selectAll('circle').size()).toBe(0);
            expect(svg.select('.focus').size()).toBe(1);
        });

        it('Focus circles and line are displayed if cursor is set', () => {
            let store = configureStore(Object.assign({}, testState, {
                series: Object.assign({}, testState.series, {
                    timeSeries: Object.assign({}, testState.series.timeSeries, {
                        '00060:current': {
                            points: currentTsData,
                            tsKey: 'current',
                            variable: '00060id'
                        },
                        '00060:compare': {
                            points: compareTsData,
                            tsKey: 'compare',
                            variable: '00060id'
                        }
                    })
                }),
                timeseriesState: Object.assign({}, testState.timeseriesState, {
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
