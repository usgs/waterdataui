const { select, selectAll } = require('d3-selection');
const { provide } = require('../../lib/redux');

const { attachToNode, timeSeriesGraph, timeSeriesLegend } = require('./index');
const { Actions, configureStore } = require('../../store');


const TEST_STATE = {
    series: {
        timeSeries: {
            '00060:current': {
                startTime: new Date('2018-01-02T15:00:00.000-06:00'),
                endTime: new Date('2018-01-02T15:00:00.000-06:00'),
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
                startTime: new Date('2018-01-02T15:00:00.000-06:00'),
                endTime: new Date('2018-01-02T15:00:00.000-06:00'),
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
                startTime: new Date('2018-01-02T15:00:00.000-06:00'),
                endTime: new Date('2018-01-02T15:00:00.000-06:00'),
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
            }
        },
        requests: {
            current: {
                timeSeriesCollections: ['coll1']
            },
            compare: {
                timeSeriesCollections: ['coll2']
            },
            median: {
                timeSeriesCollections: ['coll3']
            }
        },
        variables: {
            '45807197': {
                variableCode: '00060',
                oid: '45807197',
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
        select('body')
            .append('div')
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
        expect(svgNodes.length).toBe(2);
        expect(svgNodes[0].getAttribute('viewBox')).toContain('400 200');
        expect(graphNode.innerHTML).toContain('hydrograph-container');
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
            expect(svg.attr('title'), 'My Title');
            expect(svg.attr('desc'), 'My Description');
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
        })
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

        it('should render an svg node', () => {
            expect(selectAll('svg').size()).toBe(2);
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
            expect(selectAll('table .tooltip-table').size()).toBe(1);
        });

        it('should not have tooltips for the select series table when the screen is large', () => {
            store.dispatch(Actions.resizeUI(800, 800));
            expect(selectAll('table .tooltip-table').size()).toBe(0);
        });
    });

    describe('Adding and removing compare time series', () => {
        let store;
        beforeEach(() => {
            store = configureStore(TEST_STATE);
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesGraph);
        });

        it('Should render two lines', () => {
            expect(selectAll('svg .line-segment').size()).toBe(2);
        });

        it('Should remove one of the lines when removing the compare time series', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            expect(selectAll('svg .line-segment').size()).toBe(1);
        });

        //TODO: Consider adding a test which checks that the y axis is rescaled by
        // examining the contents of the text labels.
    });

    describe('legends should render', () => {
        let store;
        beforeEach(() => {
            store = configureStore(TEST_STATE);
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesLegend);
        });

        it('Should have three legend markers', () => {
            expect(selectAll('g.legend-marker').size()).toBe(3);
        });

        it('Should have two legend markers after the compare time series is removed', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            expect(selectAll('g.legend-marker').size()).toBe(2);
        });

        it('Should have one legend marker after the compare and median time series are removed', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            store.dispatch(Actions.toggleTimeseries('median', false));
            expect(selectAll('g.legend-marker').size()).toBe(1);
        });
    });
});
