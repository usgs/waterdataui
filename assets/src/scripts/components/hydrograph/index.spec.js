const { select, selectAll } = require('d3-selection');
const { provide } = require('../../lib/redux');

const { attachToNode, getNearestTime, timeSeriesGraph } = require('./index');
const { Actions, configureStore } = require('./store');
const { lineMarker, circleMarker } = require('./markers');


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
        const store = configureStore({
            tsData: {
                current: [{
                    time: new Date(),
                    value: 10,
                    label: 'Label',
                    qualifiers: ['P'],
                    approved: false,
                    estimated: false
                }],
                compare: [],
                medianStatistics: []
            },
            showSeries: {
                current: true,
                compare: false,
                medianStatistics: true
            },
            title: '',
            desc: ''
        });
        select(graphNode)
            .call(provide(store))
            .call(timeSeriesGraph);
        expect(graphNode.innerHTML).toContain('hydrograph-container');
    });

    describe('SVG has been made accessibile', () => {
        let svg;
        beforeEach(() => {
            const store = configureStore({
                tsData: {
                    current: [{
                        time: new Date(),
                        value: 10,
                        label: 'Label',
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }],
                    compare: [],
                    medianStatistics: []
                },
                showSeries: {
                    current: true,
                    compare: false,
                    medianStatistics: true,
                },
                title: 'My Title',
                desc: 'My Description',
            });
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

    describe('with real data from site #05370000', () => {
        /* eslint no-use-before-define: "ignore" */
        beforeEach(() => {
            const store = configureStore({
                tsData: {
                    current: [{
                        time: new Date(),
                        value: 10,
                        label: 'Label',
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false
                    }],
                    compare: [],
                    medianStatistics: MOCK_MEDIAN_STAT_DATA
                },
                showSeries: {
                    current: true,
                    compare: false,
                    medianStatistics: true
                },
                title: 'My Title',
                desc: 'My Description',
                legendMarkers: {
                    current: {
                        type: lineMarker,
                        domId: null,
                        domClass: null,
                        text: 'blah',
                        groupId: null
                    },
                    compare: {
                        type: lineMarker,
                        domId: null,
                        domClass: null,
                        text: 'blah',
                        groupId: null
                    },
                    medianStatistics: {
                        type: circleMarker,
                        r: 4,
                        domId: null,
                        domClass: null,
                        groupId: null,
                        text: 'blah'
                    }
                },
                displayMarkers: [
                    {
                        type: lineMarker,
                        domId: null,
                        domClass: null,
                        text: 'blah',
                        groupId: null
                    },
                    {
                        type: circleMarker,
                        r: 4,
                        domId: null,
                        domClass: null,
                        groupId: null,
                        text: 'blah'
                    }
                ]
            });
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesGraph);
        });

        it('should render an svg node', () => {
            expect(selectAll('svg').size()).toBe(1);
        });

        it('should render timeseries data as a line', () => {
            // There is not a good way to validate that <path d="..."/>
            // has the correct data, but we can validate that tooltips display
            // at the correct location.

            // First, confirm the chart line exists.
            expect(selectAll('svg path.line').size()).toBe(1);
        });

        it('should have a point for the median stat data with a label', () => {
            expect(selectAll('svg circle#median-point').size()).toBe(1);
            expect(selectAll('svg text#median-text').size()).toBe(1);
        });

        it('should have a legend with two markers', () => {
           expect(selectAll('g.legend-marker').size()).toBe(2);
        });
    });

    describe('Hydrograph tooltips', () => {
        let data = [12, 13, 14, 15, 16].map(hour => {
            return {
                time: new Date(`2018-01-03T${hour}:00:00.000Z`),
                label: 'label',
                value: 0
            };
        });

        it('return correct data points via getNearestTime' , () => {
            // Check each date with the given offset against the hourly-spaced
            // test data.
            function expectOffset(offset, side) {
                for (let [index, datum] of data.entries()) {
                    let expected;
                    if (side === 'left' || index === data.length - 1) {
                        expected = {datum, index};
                    } else {
                        expected = {datum: data[index + 1], index: index + 1};
                    }
                    let time = new Date(datum.time.getTime() + offset);
                    let returned = getNearestTime(data, time);

                    expect(returned.datum.time).toBe(expected.datum.time);
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

    describe('Adding and removing compare time series', () => {
        /* eslint no-use-before-define: "ignore" */
        let hydrograph;
        let store;
        beforeEach(() => {
            store = configureStore({
                tsData: {
                    current: [{
                        time: new Date(),
                        value: 10,
                        label: 'Label',
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false

                    }],
                    compare: [{
                        time: new Date(),
                        value: 10,
                        label: 'Label',
                        qualifiers: ['P'],
                        approved: false,
                        estimated: false

                    }],
                    medianStatistics: []
                },
                showSeries: {
                    current: true,
                    compare: true,
                    medianStatistics: true
                },
                legendMarkers: {
                    current: {
                        type: lineMarker,
                        domId: null,
                        domClass: null,
                        text: 'blah',
                        groupId: null
                    },
                    compare: {
                        type: lineMarker,
                        domId: null,
                        domClass: null,
                        text: 'blah',
                        groupId: null
                    },
                    medianStatistics: {
                        type: circleMarker,
                        r: 4,
                        domId: null,
                        domClass: null,
                        groupId: null,
                        text: 'blah'
                    }
                },
                displayMarkers: [],
                title: 'My Title',
                desc: 'My Description',
            });
            select(graphNode)
                .call(provide(store))
                .call(timeSeriesGraph);
        });

        it('Should render two lines', () => {
            expect(selectAll('svg path.line').size()).toBe(2);
        });

        it('Should have three legend markers', () => {
            store.dispatch(Actions.selectLegendMarkers());
            expect(selectAll('g.legend-marker').size()).toBe(3);
        });

        it('Should remove one of the lines when removing the compare time series', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            expect(selectAll('svg path.line').size()).toBe(1);
        });

        it('Should have two legend markers after the compare time series is removed', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            store.dispatch(Actions.selectLegendMarkers());
            expect(selectAll('g.legend-marker').size()).toBe(2);
        });

        //TODO: Consider adding a test which checks that the y axis is rescaled by
        // examining the contents of the text labels.
    });
});


const MOCK_DATA = [
    {
        "label": "1/3/2018, 10:00:00 AM -0600\n24.0 ft3/s",
        "time": "2018-01-03T16:00:00.000Z",
        "value": 24
    },
    {
        "label": "1/3/2018, 10:15:00 AM -0600\n24.6 ft3/s",
        "time": "2018-01-03T16:15:00.000Z",
        "value": 24
    },
    {
        "label": "1/3/2018, 10:30:00 AM -0600\n24.6 ft3/s",
        "time": "2018-01-03T16:30:00.000Z",
        "value": 24
    },
    {
        "label": "1/3/2018, 10:45:00 AM -0600\n25.0 ft3/s",
        "time": "2018-01-03T16:45:00.000Z",
        "value": 25
    },
    {
        "label": "1/3/2018, 11:00:00 AM -0600\n24.6 ft3/s",
        "time": "2018-01-03T17:00:00.000Z",
        "value": 24
    },
    {
        "label": "1/3/2018, 11:15:00 AM -0600\n24.6 ft3/s",
        "time": "2018-01-03T17:15:00.000Z",
        "value": 24
    },
    {
        "label": "1/3/2018, 11:30:00 AM -0600\n24.0 ft3/s",
        "time": "2018-01-03T17:30:00.000Z",
        "value": 24
    },
    {
        "label": "1/3/2018, 11:45:00 AM -0600\n24.0 ft3/s",
        "time": "2018-01-03T17:45:00.000Z",
        "value": 24
    },
    {
        "label": "1/3/2018, 12:00:00 PM -0600\n24.0 ft3/s",
        "time": "2018-01-03T18:00:00.000Z",
        "value": 24
    },
    {
        "label": "1/3/2018, 12:15:00 PM -0600\n24.0 ft3/s",
        "time": "2018-01-03T18:15:00.000Z",
        "value": 24
    }
];
const MOCK_DATA_FOR_PREVIOUS_YEAR = [
    {
        "label": "1/3/2017, 10:00:00 AM -0600\n24.0 ft3/s",
        "time": "2017-01-03T16:00:00.000Z",
        "value": 20
    },
    {
        "label": "1/3/2017, 10:15:00 AM -0600\n24.6 ft3/s",
        "time": "2017-01-03T16:15:00.000Z",
        "value": 24
    },
    {
        "label": "1/3/2017, 10:30:00 AM -0600\n24.6 ft3/s",
        "time": "2017-01-03T16:30:00.000Z",
        "value": 25
    },
    {
        "label": "1/3/2017, 10:45:00 AM -0600\n25.0 ft3/s",
        "time": "2017-01-03T16:45:00.000Z",
        "value": 28
    },
    {
        "label": "1/3/2017, 11:00:00 AM -0600\n24.6 ft3/s",
        "time": "2017-01-03T17:00:00.000Z",
        "value": 29
    },
    {
        "label": "1/3/2017, 11:15:00 AM -0600\n24.6 ft3/s",
        "time": "2017-01-03T17:15:00.000Z",
        "value": 29
    },
    {
        "label": "1/3/2017, 11:30:00 AM -0600\n24.0 ft3/s",
        "time": "2017-01-03T17:30:00.000Z",
        "value": 29
    },
    {
        "label": "1/3/2017, 11:45:00 AM -0600\n24.0 ft3/s",
        "time": "2017-01-03T17:45:00.000Z",
        "value": 30
    },
    {
        "label": "1/3/2018, 12:00:00 PM -0600\n24.0 ft3/s",
        "time": "2018-01-03T18:00:00.000Z",
        "value": 24
    },
    {
        "label": "1/3/2018, 12:15:00 PM -0600\n24.0 ft3/s",
        "time": "2018-01-03T18:15:00.000Z",
        "value": 24
    }
];
const MOCK_MEDIAN_STAT_DATA = [
    {
        "label": "18 ft3/s",
        "time": "2017-01-03T00:00:00.000Z",
        "value": 18
    }
];
