const { scaleLinear } = require('d3-scale');
const { select } = require('d3-selection');

const { createAxes, appendAxes } = require('./axes');


describe('Chart axes', () => {
    // xScale is oriented on the left
    const xScale = scaleLinear().range([0, 10]).domain([0, 10]);
    const yScale = scaleLinear().range([0, 10]).domain([0, 10]);
    const layout = {width: 400, height: 200};
    const {xAxis, yAxis} = createAxes({xScale, yScale}, 100);
    let svg;

    beforeEach(() => {
        svg = select(document.body).append('svg');
        appendAxes(svg, {
            xAxis,
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
        expect(yAxis).toEqual(jasmine.any(Function));
        expect(yAxis.tickSizeInner()).toBe(100);
        expect(xAxis.scale()).toBe(xScale);
        expect(yAxis.scale()).toBe(yScale);
    });

    it('axes appended', () => {
        // Should be translated
        expect(svg.select('.y-axis-label').text()).toEqual('Label title');
    });
});
