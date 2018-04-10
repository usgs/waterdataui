const { select, selectAll } = require('d3-selection');
const { provide } = require('../../lib/redux');

const { attachToNode, timeSeriesGraph, timeSeriesLegend } = require('./index');
const { Actions, configureStore } = require('../../store');


const TEST_STATE = {
    series: {
        timeSeries: {
            '00010:current': {
                points: [{
                    dateTime: new Date('2018-01-02T15:00:00.000-06:00'),
                    value: 4,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'current',
                variable: '45807190'
            },
            '00060:current': {
                points: [{
                    dateTime: new Date('2018-01-02T15:00:00.000-06:00'),
                    value: 10,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'current',
                variable: '45807197'
            },
            '00060:compare': {
                points: [{
                    dateTime: new Date('2018-01-02T15:00:00.000-06:00'),
                    value: 10,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'compare',
                variable: '45807197'
            },
            '00060:median': {
                points: [{
                    dateTime: new Date('2018-01-02T15:00:00.000-06:00'),
                    value: 10
                }],
                metadata: {
                    beginYear: '2010',
                    endYear: '2015'
                },
                method: 'method1',
                tsKey: 'median',
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
            current: {
                notes: {
                    'filter:timeRange':  {
                        mode: 'PERIOD',
                        periodDays: 7
                    },
                    requestDT: new Date('2018-03-30 11:00:00')
                }
            }
        },
        requests: {
            current: {
                timeSeriesCollections: ['coll1']
            },
            compare: {
                timeSeriesCollections: ['coll2', 'col4']
            },
            median: {
                timeSeriesCollections: ['coll3']
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
    currentVariableID: '45807197',
    showSeries: {
        current: true,
        compare: true,
        median: true
    },
    width: 400
};


describe('Hydrograph charting module', () => {
    let graphNode;

    beforeEach(() => {
        let body = select('body');
        body.append('div')
            .attr('id', 'hydrograph');
        graphNode = document.getElementById('hydrograph');
    });

    afterEach(() => {
        select('#hydrograph').remove();
    });

    it('empty graph displays warning', () => {
        attachToNode({}, graphNode, {});
        expect(graphNode.innerHTML).toContain('No data is available');
    });

    it('single data point renders', () => {
        const store = configureStore(TEST_STATE);
        select(graphNode)
            .call(provide(store))
            .call(timeSeriesGraph);
        let svgNodes = graphNode.getElementsByTagName('svg');
        expect(svgNodes.length).toBe(3);
        expect(graphNode.innerHTML).toContain('hydrograph-container');
    });

    describe('container display', () => {

        it('should not be hidden tag if there is data', () => {
            const store = configureStore(TEST_STATE);
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesGraph);
            expect(select('#hydrograph').attr('hidden')).toBeNull();
        });

        it('should have a style tag if there is no data', () => {
            const store = configureStore({series: {timeseries: {}}});
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesGraph);
        });
    });

    describe('SVG has been made accessibile', () => {
        let svg;
        beforeEach(() => {
            const store = configureStore(TEST_STATE);
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesGraph);
            svg = select('svg');
        });

        it('title and desc attributes are present', function() {
            const descText = svg.select('desc').text();

            expect(svg.select('title').text()).toEqual('Test title for 00060');
            expect(descText).toContain('Test description for 00060');
            expect(descText).toContain('3/23/2018');
            expect(descText).toContain('3/30/2018');
            expect(svg.attr('aria-labelledby')).toContain('title');
            expect(svg.attr('aria-describedby')).toContain('desc');
        });

        it('svg should be focusable', function() {
            expect(svg.attr('tabindex')).toBe('0');
        });

        it('should have an accessibility table for each time series', function() {
            expect(selectAll('table.usa-sr-only').size()).toBe(3);
        });

        it('should have a div for each type of time series', function() {
            expect(selectAll('div#sr-only-median').size()).toBe(1);
            expect(selectAll('div#sr-only-compare').size()).toBe(1);
            expect(selectAll('div#sr-only-current').size()).toBe(1);
        });
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
                            startTime: new Date('2018-01-02T15:00:00.000-06:00'),
                            endTime: new Date('2018-01-02T16:00:00.000-06:00'),
                            points: [{
                                dateTime: new Date('2018-01-02T15:00:00.000-06:00'),
                                value: 10,
                                qualifiers: ['P']
                            }, {
                                dateTime: new Date('2018-01-02T16:00:00.000-06:00'),
                                value: null,
                                qualifiers: ['P', 'FLD']
                            }]
                        }
                    }
                },
                showSeries: {
                    current: true,
                    compare: true,
                    median: true
                },
                title: 'My Title',
                desc: 'My Description',
                showMedianStatsLabel: false,
                windowWidth: 400,
                width: 400,
                currentVariableID: '45807197'
            });
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesGraph);
        });

        it('should render the correct number svg nodes', () => {
            // one main hydrograph and two sparklines
            expect(selectAll('svg').size()).toBe(3);
        });

        it('should have a title div', () => {
            const titleDiv = selectAll('.timeseries-graph-title');
            expect(titleDiv.size()).toBe(1);
            expect(titleDiv.text()).toEqual('Test title for 00060');
        });

        it('should have a defs node', () => {
            expect(selectAll('defs').size()).toBe(1);
            expect(selectAll('defs mask').size()).toBe(1);
            expect(selectAll('defs pattern').size()).toBe(2);
        });

        it('should render timeseries data as a line', () => {
            // There should be one segment per time-series. Each is a single
            // point, so should be a circle.
            expect(selectAll('svg .line-segment').size()).toBe(2);
        });

        it('should render a rectangle for masked data', () => {
            expect(selectAll('g.current-mask-group').size()).toBe(1);
        });

        it('should have a point for the median stat data with a label', () => {
            expect(selectAll('svg #median-points circle.median-data-series').size()).toBe(1);
            expect(selectAll('svg #median-points text').size()).toBe(0);
        });

        it('show the labels for the median stat data showMedianStatsLabel is true', () => {
            store.dispatch(Actions.showMedianStatsLabel(true));
            expect(selectAll('svg #median-points text').size()).toBe(1);
        });

        it('should have tooltips for the select series table', () => {
            // one for each of the two parameters
            expect(selectAll('table .tooltip-item').size()).toBe(2);
        });

        it('should not have tooltips for the select series table when the screen is large', () => {
            store.dispatch(Actions.resizeUI(800, 800));
            expect(selectAll('table .tooltip-table').size()).toBe(0);
        });
    });

    //TODO: Consider adding a test which checks that the y axis is rescaled by
    // examining the contents of the text labels.

    describe('legends should render', () => {
        let store;
        beforeEach(() => {
            store = configureStore(TEST_STATE);
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesLegend);
        });

        it('Should have 6 legend markers', () => {
            expect(selectAll('.legend g').size()).toBe(6);
        });

        it('Should have four legend markers after the compare time series is removed', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            expect(selectAll('.legend g').size()).toBe(4);
        });

        it('Should have two legend marker after the compare and median time series are removed', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            store.dispatch(Actions.toggleTimeseries('median', false));
            expect(selectAll('.legend g').size()).toBe(2);
        });
    });

    describe('last year checkbox', () => {

        let store;
        beforeEach(() => {
            store = configureStore(TEST_STATE);
            attachToNode(store, graphNode, {siteno: '12345678'});
        });

        it('Should render the compare toggle checked', () => {
            const checkbox = select('#last-year-checkbox');
            expect(checkbox.size()).toBe(1);
            expect(checkbox.property('checked')).toBe(true);
        });

        it('Should render the compare toggle unchecked', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            const checkbox = select('#last-year-checkbox');
            expect(checkbox.size()).toBe(1);
            expect(checkbox.property('checked')).toBe(false);
        });

        it('should be enabled if there are last year data', () => {
            expect(select('#last-year-checkbox').property('disabled')).toBeFalsy();
        });

        it('should be disabled if there are no last year data', () => {
            store.dispatch(Actions.setCurrentParameterCode('00010', '45807190'));
            expect(select('#last-year-checkbox').property('disabled')).toBeTruthy();
        });

        it('Should render one lines', () => {
            expect(selectAll('#ts-compare-group .line-segment').size()).toBe(1);
        });

        it('Should remove the lines when removing the compare time series', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            expect(selectAll('#ts-compare-group .line-segment').size()).toBe(0);
        });
    });
});
