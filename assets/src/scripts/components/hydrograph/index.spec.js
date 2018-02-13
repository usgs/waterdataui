const { select, selectAll } = require('d3-selection');
const { provide } = require('../../lib/redux');

const { attachToNode, getNearestTime, timeSeriesGraph } = require('./index');
const { Actions, configureStore } = require('./store');


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
            desc: '',
            width: 400
        });
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
                width: 400
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

    describe('SVG contains the expected elements', () => {
        /* eslint no-use-before-define: "ignore" */
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
                showMedianStatsLabel: false,
                width: 400
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
            expect(selectAll('svg text#median-text').size()).toBe(0);
        });

        it('should have a legend with two markers', () => {
           expect(selectAll('g.legend-marker').size()).toBe(2);
        });

        it('show the labels for the median stat data showMedianStatsLabel is true', () => {
            store.dispatch(Actions.showMedianStatsLabel(true));

            expect(selectAll('svg text#median-text').size()).toBe(1);

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
            expect(selectAll('g.legend-marker').size()).toBe(3);
        });

        it('Should remove one of the lines when removing the compare time series', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            expect(selectAll('svg path.line').size()).toBe(1);
        });

        it('Should have two legend markers after the compare time series is removed', () => {
            store.dispatch(Actions.toggleTimeseries('compare', false));
            expect(selectAll('g.legend-marker').size()).toBe(2);
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
