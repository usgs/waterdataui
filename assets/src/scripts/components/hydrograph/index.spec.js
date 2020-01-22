import { select, selectAll } from 'd3-selection';
import { attachToNode } from './index';
import { Actions, configureStore } from '../../store';


const TEST_STATE = {
    series: {
        timeSeries: {
            '00010:current': {
                points: [{
                    dateTime: 1514926800000,
                    value: 4,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'current:P7D',
                variable: '45807190'
            },
            '00060:current': {
                points: [{
                    dateTime: 1514926800000,
                    value: 10,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'current:P7D',
                variable: '45807197'
            },
            '00060:compare': {
                points: [{
                    dateTime: 1514926800000,
                    value: 10,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'compare:P7D',
                variable: '45807197'
            }
        },
        timeSeriesCollections: {
            'coll1': {
                variable: '45807197',
                timeSeries: ['00060:current']
            },
            'coll2': {
                variable: '45807197',
                timeSeries: ['00060:compare']
            },
            'coll3': {
                variable: '45807197',
                timeSeries: ['00060:median']
            },
            'coll4': {
                variable: '45807190',
                timeSeries: ['00010:current']
            }
        },
        queryInfo: {
            'current:P7D': {
                notes: {
                    'filter:timeRange':  {
                        mode: 'PERIOD',
                        periodDays: 7
                    },
                    requestDT: 1522425600000
                }
            }
        },
        requests: {
            'current:P7D': {
                timeSeriesCollections: ['coll1']
            },
            'compare:P7D': {
                timeSeriesCollections: ['coll2', 'col4']
            }
        },
        variables: {
            '45807197': {
                variableCode: {
                    value: '00060'
                },
                oid: '45807197',
                variableName: 'Test title for 00060',
                variableDescription: 'Test description for 00060',
                unit: {
                    unitCode: 'unitCode'
                }
            },
            '45807190': {
                variableCode: {
                    value: '00010'
                },
                oid: '45807190',
                unit: {
                    unitCode: 'unitCode'
                }
            }
        },
        methods: {
            'method1': {
                methodDescription: 'method description'
            }
        }
    },
    statisticsData : {
        median: {
            '00060': {
                '1234': [
                    {
                        month_nu: '2',
                        day_nu: '20',
                        p50_va: '40',
                        begin_yr: '1970',
                        end_yr: '2017',
                        loc_web_ds: 'This method'
                    }, {
                        month_nu: '2',
                        day_nu: '21',
                        p50_va: '41',
                        begin_yr: '1970',
                        end_yr: '2017',
                        loc_web_ds: 'This method'
                    }, {
                        month_nu: '2',
                        day_nu: '22',
                        p50_va: '42',
                        begin_yr: '1970',
                        end_yr: '2017',
                        loc_web_ds: 'This method'
                    }
                ]
            }
        }
    },
    timeSeriesState: {
        currentVariableID: '45807197',
        currentDateRange: 'P7D',
        requestedTimeRange: null,
        showSeries: {
            current: true,
            compare: true,
            median: true
        },
        loadingTSKeys: []
    },
    ui: {
        width: 400
    }
};


describe('Hydrograph charting and Loading indicators and data alerts', () => {
    let graphNode;

    beforeEach(() => {
        let body = select('body');
        let component = body.append('div')
            .attr('id', 'hydrograph');
        component.append('div').attr('class', 'loading-indicator-container');
        component.append('div').attr('class', 'graph-container');
        component.append('div').attr('class', 'select-time-series-container');
        component.append('div').attr('class', 'provisional-data-alert');

        graphNode = document.getElementById('hydrograph');

        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
        select('#hydrograph').remove();
    });

    it('empty graph displays warning', () => {
        attachToNode({}, graphNode, {});
        expect(graphNode.innerHTML).toContain('No data is available');
    });

    describe('SVG contains the expected elements', () => {
        /* eslint no-use-before-define: 0 */
        let store;
        beforeEach(() => {
            store = configureStore({
                ...TEST_STATE,
                series: {
                    ...TEST_STATE.series,
                    timeSeries: {
                        ...TEST_STATE.series.timeSeries,
                        '00060:current': {
                            ...TEST_STATE.series.timeSeries['00060:current'],
                            startTime: 1514926800000,
                            endTime: 1514930400000,
                            points: [{
                                dateTime: 1514926800000,
                                value: 10,
                                qualifiers: ['P']
                            }, {
                                dateTime: 1514930400000,
                                value: null,
                                qualifiers: ['P', 'FLD']
                            }]
                        }
                    }
                },
                timeSeriesState: {
                    showSeries: {
                        current: true,
                        compare: true,
                        median: true
                    },
                    currentVariableID: '45807197',
                    currentDateRange: 'P7D',
                    currentMethodID: 'method1',
                    loadingTSKeys: []
                },
                ui: {
                    windowWidth: 400,
                    width: 400
                }

            });

            attachToNode(store, graphNode, {siteno: '123456788'});
        });

        it('should render the correct number of svg nodes', () => {
            // one main hydrograph, legend and two sparklines
            expect(selectAll('svg').size()).toBe(4);
        });

        it('should have a title div', () => {
            const titleDiv = selectAll('.time-series-graph-title');
            expect(titleDiv.size()).toBe(1);
            expect(titleDiv.text()).toEqual('Test title for 00060, method description');
        });

        it('should have a defs node', () => {
            expect(selectAll('defs').size()).toBe(1);
            expect(selectAll('defs mask').size()).toBe(1);
            expect(selectAll('defs pattern').size()).toBe(2);
        });

        it('should render time series data as a line', () => {
            // There should be one segment per time-series. Each is a single
            // point, so should be a circle.
            expect(selectAll('.hydrograph-svg .line-segment').size()).toBe(2);
        });

        it('should render a rectangle for masked data', () => {
            expect(selectAll('.hydrograph-svg g.current-mask-group').size()).toBe(1);
        });

        it('should have a point for the median stat data with a label', () => {
            expect(selectAll('#median-points path').size()).toBe(1);
            expect(selectAll('#median-points text').size()).toBe(0);
        });

        it('should have tooltips for the select series table', () => {
            // one for each of the two parameters
            expect(selectAll('table .tooltip-item').size()).toBe(2);
        });

        it('should not have tooltips for the select series table when the screen is large', (done) => {
            store.dispatch(Actions.resizeUI(800, 800));
            window.requestAnimationFrame(() => {
                expect(selectAll('table .tooltip-table').size()).toBe(0);
                done();
            });
        });
    });

    describe('hiding/showing provisional alert', () => {

        it('Expects the provisional alert to be visible when time series data is provided', () => {
            let store = configureStore(TEST_STATE);
            attachToNode(store, graphNode, {siteno: '12345678'});

            expect(select(graphNode).select('.provisional-data-alert').attr('hidden')).toBeNull();
        });

        it('Expects the provisional alert to be hidden when no time series data is provided', () => {
            let store = configureStore({
                ...TEST_STATE,
                series: {},
                timeSeriesState: {
                    ...TEST_STATE.timeSeriesState,
                    currentVariableID: ''
                }
            });
            attachToNode(store, graphNode, {siteno: '12345678'});

            expect(select(graphNode).select('.provisional-data-alert').attr('hidden')).toBe('true');
        });
    });

    describe('Tests for loading indicators', () => {

        it('Expects the graph loading indicator to be visible if the current 7 day data is being loaded', () => {
            const newTestState = {
                ...TEST_STATE,
                timeSeriesState: {
                    ...TEST_STATE.timeSeriesState,
                    currentDateRange: 'P7D',
                    loadingTSKeys: ['current:P7D']
                }
            };
            let store = configureStore(newTestState);
            spyOn(store, 'dispatch').and.callThrough();
            attachToNode(store, graphNode, {siteno: '12345678'});

            expect(select(graphNode).select('.loading-indicator-container').select('.loading-indicator').size()).toBe(1);
        });

        it('Expects the graph loading indicator to not be visible if the current 7 day data is not being loaded', () => {
            const newTestState = {
                ...TEST_STATE,
                timeSeriesState: {
                    ...TEST_STATE.timeSeriesState,
                    currentDateRange: 'P7D'
                }
            };
            let store = configureStore(newTestState);
            spyOn(store, 'dispatch').and.callThrough();
            attachToNode(store, graphNode, {siteno: '12345678'});
            store.dispatch(Actions.removeTimeSeriesLoading(['current:P7D']));

            expect(select(graphNode).select('.loading-indicator-container').select('.loading-indicator').size()).toBe(0);
        });

        it('Expects the date range control loading indicator to be visible if loading is in progress for the selected date range', () => {
            const newTestState = {
                ...TEST_STATE,
                timeSeriesState: {
                    ...TEST_STATE.timeSeriesState,
                    currentDateRange: 'P30D',
                    loadingTSKeys: ['current:P30D:00060']
                }
            };
            let store = configureStore(newTestState);
            attachToNode(store, graphNode, {siteno: '12345678'});

            expect(select(graphNode).select('#ts-daterange-select-container').select('.loading-indicator').size()).toBe(1);
        });

        it('Expects the date range control loading indicator to notbe visible if not loading for the selected date range', () => {
            const newTestState = {
                ...TEST_STATE,
                timeSeriesState: {
                    ...TEST_STATE.timeSeriesState,
                    currentDateRange: 'P30D',
                    loadingTSKeys: ['compare:P30D:00060']
                }
            };
            let store = configureStore(newTestState);
            attachToNode(store, graphNode, {siteno: '12345678'});

            expect(select(graphNode).select('#ts-daterange-select-container').select('.loading-indicator').size()).toBe(0);
        });

        it('Expects that the no data alert will not be shown if there is data', () => {
            let store = configureStore(TEST_STATE);
            attachToNode(store, graphNode, {siteno: '12345678'});

            expect(select(graphNode).select('#no-data-message').size()).toBe(0);
        });
    });
});
