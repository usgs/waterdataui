const { createAxes, updateYAxis, appendAxes } = require('./axes');
const { scaleLinear } = require('d3-scale');
const { select } = require('d3-selection');


describe('Chart axes', () => {
    // xScale is oriented on the left
    const xScale = scaleLinear().range([0, 10]).domain([0, 10]);
    const yScale = scaleLinear().range([0, 10]).domain([0, 10]);
    const {xAxis, yAxis} = createAxes(xScale, yScale, 100);
    let svg;

    beforeEach(() => {
        svg = select(document.body).append('svg');
        appendAxes({
            plot: svg,
            xAxis,
            yAxis,
            xLoc: {x: 10, y: 10},
            yLoc: {x: 0, y: 100},
            yLabelLoc: {x: 10, y: 10},
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
        expect(svg.select('.x-axis').attr('transform')).toBe('translate(10, 10)');
        expect(svg.select('.y-axis').attr('transform')).toBe('translate(0, 100)');
        expect(svg.select('.y-axis-label').text()).toEqual('Label title');
    });

    it('tickValues should change with scale with new domain', () => {
        const originalTickValues = yAxis.tickValues();
        yScale.domain([2, 20]);
        updateYAxis(yAxis, yScale);
        expect(yAxis.tickValues()).not.toEqual(originalTickValues);

        yScale.domain([0, 10]);
        updateYAxis(yAxis, yScale);
        expect(yAxis.tickValues()).toEqual(originalTickValues);
    });
});
