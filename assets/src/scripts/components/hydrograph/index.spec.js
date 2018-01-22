const { select, selectAll } = require('d3-selection');

const Hydrograph = require('./index').Hydrograph;


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
        new Hydrograph({element: graphNode});
        expect(graphNode.innerHTML).toContain('No data is available');
    });

    it('single data point renders', () => {
        new Hydrograph({
            element: graphNode,
            data: [{
                time: new Date(),
                value: 10,
                label: 'Label'
            }]
        });
        expect(graphNode.innerHTML).toContain('hydrograph-container');
    });

    describe('SVG has been made accessibile', () => {
        let svg;
        beforeEach(() => {
            new Hydrograph({
                element: graphNode,
                title: 'My Title',
                desc: 'My Description',
                data: [{
                    time: new Date(),
                    value: 10,
                    label: 'Label'
                }]
            });
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

    describe('Renders real data from site #05370000', () => {
        /* eslint no-use-before-define: "ignore" */
        beforeEach(() => {
            new Hydrograph({element: graphNode, data: MOCK_DATA});
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
    });

    describe('Hydrograph tooltips', () => {
        let graph;
        let data = [12, 13, 14, 15, 16].map(hour => {
            return {
                time: new Date(`2018-01-03T${hour}:00:00.000Z`),
                label: 'label',
                value: 0
            };
        });
        beforeEach(() => {
            graph = new Hydrograph({element: graphNode, data: data});
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
                    let returned = graph._getNearestTime(time);
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
