const { scaleLinear, scaleTime } = require('d3-scale');
const { select } = require('d3-selection');

const { createAxes, appendAxes } = require('./axes');


describe('Chart axes', () => {
    // xScale is oriented on the left
    const xScale = scaleTime().range([0, 10]).domain([new Date('2011-10-10'), new Date('2012-10-10')]);
    const yScale = scaleLinear().range([0, 10]).domain([0, 10]);
    const layout = {
        width: 400,
        height: 200,
        margin: {
            top: 25,
            right: 0,
            bottom: 10,
            left: 65
        }
    };
    const {xAxis, xAxisWithDateTimeLabels, yAxis} = createAxes({xScale, yScale}, 100, '00060', 'P7D');
    let svg;

    beforeEach(() => {
        svg = select(document.body).append('svg');
        appendAxes(svg, {
            xAxis,
            xAxisWithDateTimeLabels,
            yAxis,
            layout,
            yTitle: 'Label title'
        });
    });

    afterEach(() => {
        select('svg').remove();
    });

    it('axes created', () => {
        expect(xAxis).toEqual(jasmine.any(Function));
        expect(xAxisWithDateTimeLabels).toEqual(jasmine.any(Function));
        expect(yAxis).toEqual(jasmine.any(Function));
        expect(yAxis.tickSizeInner()).toBe(100);
        expect(xAxis.scale()).toBe(xScale);
        expect(yAxis.scale()).toBe(yScale);
    });

    it('axes appended', () => {
        // Should be translated
        let tspans = [];
        svg.select('.y-axis-label').selectAll('tspan').each(function () {
            tspans.push(this.textContent);
        });
        expect(tspans.join(' ')).toEqual('Label title');
    });

    //TODO: Add tests to make sure the second axis doesn't render.
});
