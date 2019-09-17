import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { createAxes, appendAxes, generateDateTicks } from './axes';


describe('Chart axes', () => {
    // xScale is oriented on the left
    const xScale = scaleLinear().range([0, 10]).domain([1318230000000, 1318230000000]);
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
        const startCustomUnderOneDecade = 1274590800000;
        const startCustomOverTwoDecades = 651906000000;

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

        it('uses weekly ticks for 7 or fewer days for a custom date range', () => {
            const result = generateDateTicks(startP7D, endDate, 'custom', timeZone);
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

        it('uses weekly ticks for a different of days 7 between 30 for a custom date range', () => {
            const result = generateDateTicks(startP30D, endDate, 'custom', timeZone);
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
            expect(result.includes(1475305200000)).toBe(true);
            expect(result.includes(1480579200000)).toBe(true);
            expect(result.includes(1496300400000)).toBe(true);
            expect(result.includes(1501570800000)).toBe(true);
        });

        it('custom uses monthly marks for 30 days through a year', () => {
            const result = generateDateTicks(startP1Y, endDate, 'custom', timeZone);
            expect(result.length).toBeGreaterThanOrEqual(6);
            expect(result.includes(1475305200000)).toBe(true);
            expect(result.includes(1480579200000)).toBe(true);
            expect(result.includes(1496300400000)).toBe(true);
            expect(result.includes(1501570800000)).toBe(true);
        });

        it('custom ticks are correctly generated for dates under one decade', () => {
            const result = generateDateTicks(startCustomUnderOneDecade, endDate, 'custom', timeZone);
            expect(result).toEqual([
                1293868800000,
                1314860400000,
                1335855600000,
                1357027200000,
                1378018800000,
                1398927600000,
                1420099200000,
                1441090800000,
                1462086000000,
                1483257600000
            ]);
        });

        it('custom ticks use correctly for dates over two decades', () => {
            const result = generateDateTicks(startCustomOverTwoDecades, endDate, 'custom', timeZone);
            expect(result).toEqual([
                723196800000,
                796723200000,
                870418800000,
                944035200000,
                1017648000000,
                1091343600000,
                1164960000000,
                1238569200000,
                1312182000000,
                1385884800000,
                1459494000000
            ]);
        });
    });
});
