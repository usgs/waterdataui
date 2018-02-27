const { select, selectAll } = require('d3-selection');
const { provide } = require('../../lib/redux');

const { attachToNode, timeSeriesGraph } = require('./index');
const { Actions, configureStore } = require('./store');


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
                }]
            },
            '00060:compare': {
                startTime: new Date('2018-01-02T15:00:00.000-06:00'),
                endTime: new Date('2018-01-02T15:00:00.000-06:00'),
                points: [{
                    dateTime: new Date('2018-01-02T15:00:00.000-06:00'),
                    value: 10,
                    qualifiers: ['P']
                }]
            }
        },
        timeSeriesCollections: {
            'coll1': {
                variable: 45807197,
                timeSeries: ['00060:current']
            },
            'coll2': {
                variable: 45807197,
                timeSeries: ['00060:compare']
            }
        },
        requests: {
            current: {
                timeSeriesCollections: ['coll1']
            },
            compare: {
                timeSeriesCollections: ['coll2']
            }
        },
        variables: {
            '45807197': {
                variableCode: '00060',
                oid: 45807197,
                unit: {
                    unitCode: 'unitCode'
                }
            }
        }
    },
    currentVariableID: '45807197',
    showSeries: {
        current: true,
        compare: true
    },
    width: 400
};


describe('Hydrograph charting module', () => {
    let graphNode;

    beforeEach(() => {
        select('body')
            .append('div')
            .attr('id', 'hydrograph');
        graphNode = document.getElementById('hydrograph')
    });

    afterEach(() => {
        select('#hydrograph').remove();
    });

    it('empty graph displays warning', () => {
        attachToNode(graphNode, {});
        expect(graphNode.innerHTML).toContain('No data is available');
    });

    it('single data point renders', () => {
        const store = configureStore(TEST_STATE);
        select(graphNode)
            .call(provide(store))
            .call(timeSeriesGraph);
        let svgNodes = graphNode.getElementsByTagName('svg');
        expect(svgNodes.length).toBe(1);
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
            let labelledBy = svg.attr('aria-labelledby');
            expect(labelledBy).toContain('title');
            expect(labelledBy).toContain('desc');
        });

        it('svg should be focusable', function() {
           expect(svg.attr('tabindex')).toBe('0');
        });
    });

    describe('SVG contains the expected elements', () => {
        /* eslint no-use-before-define: "ignore" */
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
                }
            });
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesGraph);
        });

        it('should render an svg node', () => {
            expect(selectAll('svg').size()).toBe(1);
        });

        it('should have a defs node', () => {
            expect(selectAll('defs').size()).toBe(1);
            expect(selectAll('defs mask').size()).toBe(1);
            expect(selectAll('defs pattern').size()).toBe(2);
        });

        it('should render timeseries data as a line', () => {
            // There is not a good way to validate that <path d="..."/>
            // has the correct data, but we can validate that tooltips display
            // at the correct location.

            // First, confirm the chart line exists.
            expect(selectAll('svg path.line').size()).toBe(2);
        });

        it('should render a rectangle for masked data', () => {
            expect(selectAll('g.current-mask-group').size()).toBe(1);
        });

        xit('should have a point for the median stat data with a label', () => {
            expect(selectAll('svg #median-points circle.median-data-series').size()).toBe(1);
            expect(selectAll('svg #median-points text').size()).toBe(0);
        });

        xit('should have a legend with two markers', () => {
           expect(selectAll('g.legend-marker').size()).toBe(4);
        });

        xit('show the labels for the median stat data showMedianStatsLabel is true', () => {
            store.dispatch(Actions.showMedianStatsLabel(true));

            expect(selectAll('svg #median-points text').size()).toBe(1);

        });
    });

    describe('Adding and removing compare time series', () => {
        /* eslint no-use-before-define: "ignore" */
        let store;
        beforeEach(() => {
            store = configureStore(TEST_STATE);
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesGraph);
        });

        it('Should render two lines', () => {
            expect(selectAll('svg path.line').size()).toBe(2);
        });

        xit('Should have three legend markers', () => {
            expect(selectAll('g.legend-marker').size()).toBe(5);
        });

        it('Should remove one of the lines when removing the compare time series', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            expect(selectAll('svg path.line').size()).toBe(1);
        });

        xit('Should have two legend markers after the compare time series is removed', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            expect(selectAll('g.legend-marker').size()).toBe(3);
        });

        //TODO: Consider adding a test which checks that the y axis is rescaled by
        // examining the contents of the text labels.
    });
});


const MOCK_MEDIAN_STAT_DATA = [
    {
        "label": "18 ft3/s",
        "time": "2017-01-03T00:00:00.000Z",
        "value": 18
    }
];
