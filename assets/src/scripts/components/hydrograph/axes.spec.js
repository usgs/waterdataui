const { scaleLinear, scaleTime } = require('d3-scale');
const { select } = require('d3-selection');

const { createAxes, appendAxes, generateDateTicks } = require('./axes');


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
    const timeZone = 'America/Los_Angeles';
    const {xAxis, yAxis} = createAxes({xScale, yScale}, 100, '00060', 'P7D', timeZone);
    let svg;

    describe('appendAxes', () => {
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
            let tspans = [];
            svg.select('.y-axis-label').selectAll('tspan').each(function () {
                tspans.push(this.textContent);
            });
            expect(tspans.join(' ')).toEqual('Label title');
        });
        // TODO: Add tests to make sure the second axis doesn't render.
    });

    describe('generateDateTicks', () => {

        const endDate = 1504215240000;
        const startP7D = 1503610440000;
        const startP30D = 1501623240000;
        const startP1Y = 1472679240000;

        it('creates tick marks for a 7 day period', () => {
            const result = generateDateTicks(startP7D, endDate, 'P7D', timeZone);
            expect(result).toEqual([
                1503644400000,
                1503730800000,
                1503817200000,
                1503903600000,
                1503990000000,
                1504076400000,
                1504162800000
            ]);
        });

        it('creates tick marks for a 30 day period', () => {
            const result = generateDateTicks(startP30D, endDate, 'P30D', timeZone);
            expect(result).toEqual([
                1502002800000,
                1502607600000,
                1503212400000,
                1503817200000
            ]);
        });

        it('creates tick marks for a 1 year period', () => {
            const result = generateDateTicks(startP1Y, endDate, 'P1Y', timeZone);
            expect(result.length).toBeGreaterThanOrEqual(6);
        });
    });
});
