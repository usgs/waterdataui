import {select} from 'd3-selection';

import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';
import {Actions} from 'ml/store/instantaneous-value-time-series-state';

import {drawTooltipText, drawTooltipFocus, drawTooltipCursorSlider} from './tooltip';

describe('monitoring-location/components/hydrograph/tooltip module', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

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
        ivTimeSeriesData: {
            timeSeries: {
                '69928:current:P7D': {
                    points: data,
                    tsKey: 'current:P7D',
                    variable: '00060id',
                    methodID: 69928
                },
                '69928:compare:P7D': {
                    points: data,
                    tsKey: 'compare:P7D',
                    variable: '00060id',
                    methodID: 69928
                },
                '69929:current:P7D': {
                    points: data,
                    tsKey: 'current:P7D',
                    variable: '00010id',
                    methodID: 69929
                },
                '69929:compare:P7D': {
                    points: data,
                    tsKey: 'compare:P7D',
                    variable: '00010id',
                    methodID: 69929
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
        ivTimeSeriesState: {
            showIVTimeSeries: {
                current: true,
                compare: true
            },
            currentIVVariableID: '00060id',
            currentIVMethodID: 69928,
            currentIVDateRange: 'P7D',
            customIVTimeRange: null,
            ivGraphCursorOffset: 61200000
        },
        ui: {
            windowWidth: 1300,
            width: 990
        }
    };

    describe('drawTooltipText', () => {
        let div;
        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        it('Creates the container for tooltips', () => {
            let store = configureStore({
                ivTimeSeriesState: {
                    ivGraphCursorOffset: null,
                    showIVTimeSeries: {
                        current: true
                    }
                }
            });

            div.call(drawTooltipText, store);

            const textGroup = div.selectAll('.tooltip-text-group');
            expect(textGroup.size()).toBe(1);
        });

        it('Creates the text elements with the label for the focus times', () => {
            let store = configureStore(Object.assign({}, testState, {
                ivTimeSeriesState: Object.assign({}, testState.ivTimeSeriesState, {
                    ivGraphCursorOffset: 2 * 60 * 60 * 1000
                })
            }));

            div.call(drawTooltipText, store);

            let value = div.select('.current-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('14 ft3/s');
            value = div.select('.compare-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('14 ft3/s');
        });

        it('Text contents are updated when the store is provided with new focus times', () => {
            let store = configureStore(Object.assign({}, testState, {
                ivTimeSeriesState: Object.assign({}, testState.ivTimeSeriesState, {
                    ivGraphCursorOffset: 1
                })
            }));

            div.call(drawTooltipText, store);

            let value = div.select('.current-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('12 ft3/s');
            store.dispatch(Actions.setIVGraphCursorOffset(3 * 60 * 60 * 1000));

            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    value = div.select('.current-tooltip-text').text().split(' - ')[0];
                    expect(value).toBe('15 ft3/s');

                    value = div.select('.compare-tooltip-text').text().split(' - ')[0];
                    expect(value).toBe('15 ft3/s');
                    resolve();
                });
            });
        });

        it('Shows the qualifier text if focus is near masked data points', () => {
            let store = configureStore(Object.assign({}, testState, {
                ivTimeSeriesState: Object.assign({}, testState.ivTimeSeriesState, {
                    ivGraphCursorOffset: 1
                })
            }));

            div.call(drawTooltipText, store);
            store.dispatch(Actions.setIVGraphCursorOffset(299 * 60 * 1000));  // 2018-01-03T16:59:00.000Z

            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.select('.current-tooltip-text').text()).toContain('Flood');
                    resolve();
                });
            });
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
                ivTimeSeriesData: Object.assign({}, testState.ivTimeSeriesData, {
                    timeSeries: Object.assign({}, testState.ivTimeSeriesData.timeSeries, {
                        '69928:current:P7D': Object.assign({}, testState.ivTimeSeriesData.timeSeries['69928:current:P7D'], {
                            points: zeroData
                        })
                    })
                }),
                ivTimeSeriesState: Object.assign({}, testState.ivTimeSeriesState, {
                    ivGraphCursorOffset: 10
                })
            }));
            div.call(drawTooltipText, store);
            store.dispatch(Actions.setIVGraphCursorOffset(119 * 60 * 1000));
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    let value = div.select('.current-tooltip-text').text().split(' - ')[0];

                    expect(value).toBe('0 ft3/s');
                    resolve();
                });
            });
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
                ivTimeSeriesData: Object.assign({}, testState.ivTimeSeriesData, {
                    timeSeries: Object.assign({}, testState.ivTimeSeriesData.timeSeries, {
                        '69928:current:P7D': {
                            points: currentTsData,
                            tsKey: 'current:P7D',
                            variable: '00060id',
                            methodID: 69928
                        },
                        '69928:compare:P7D': {
                            points: compareTsData,
                            tsKey: 'compare:P7D',
                            variable: '00060id',
                            methodID: 69928
                        }
                    })
                }),
                ivTimeSeriesState: Object.assign({}, testState.ivTimeSeriesState, {
                    ivGraphCursorOffset: null
                })
            }));

            svg.call(drawTooltipFocus, store);

            expect(svg.selectAll('.focus-line').size()).toBe(1);
            expect(svg.selectAll('.focus-circle').size()).toBe(2);
            expect(svg.select('.focus-overlay').size()).toBe(1);
        });

        it('Focus circles and line are displayed if cursor is set', () => {
            let store = configureStore(Object.assign({}, testState, {
                ivTimeSeriesData: Object.assign({}, testState.ivTimeSeriesData, {
                    timeSeries: Object.assign({}, testState.ivTimeSeriesData.timeSeries, {
                        '69928:current:P7D': {
                            points: currentTsData,
                            tsKey: 'current:P7D',
                            variable: '00060id',
                            methodID: 69928
                        },
                        '69928:compare:P7D': {
                            points: compareTsData,
                            tsKey: 'compare:P7D',
                            variable: '00060id',
                            methodID: 69928
                        }
                    })
                }),
                ivTimeSeriesState: Object.assign({}, testState.ivTimeSeriesState, {
                    ivGraphCursorOffset: 39 * 60 * 1000
                })
            }));

            svg.call(drawTooltipFocus, store);

            expect(svg.selectAll('.focus-line').size()).toBe(1);
            expect(svg.selectAll('.focus-circle').size()).toBe(2);
            expect(svg.select('.focus-overlay').size()).toBe(1);
        });
    });

    describe('drawTooltipCursorSlider', () => {
        let div;
        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        it('should render the cursor slider', () => {
            let store = configureStore(testState);
            drawTooltipCursorSlider(div, store);

            const sliderSvg = div.selectAll('.cursor-slider-svg');
            const slider = sliderSvg.selectAll('.slider');

            expect(sliderSvg.size()).toBe(1);
            expect(slider.size()).toBe(1);
        });
    });
});
