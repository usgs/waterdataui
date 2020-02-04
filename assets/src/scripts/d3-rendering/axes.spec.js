import {scaleLinear} from 'd3-scale';
import {select} from 'd3-selection';

import {appendXAxis} from './axes';

describe('axes module', () => {
    let svg;

    beforeEach(() => {
        svg = select('body').append('svg');
    });

    afterEach(() => {
        svg.remove();
    });

    describe('appendXAxis', () => {
        it('should render the xAxis', () =>  {
            const xScale = scaleLinear()
                .domain([10, 110])
                .range([0, 500]);
            const layout = {
                width: 500
            }
        });
    });
    /*
    describe('appendAxes', () => {
        const secondaryYScale = null;
        let {xAxis, yAxis, secondaryYAxis} = createAxes(
            xScale, yScale, secondaryYScale,
            100, '00060', 'P7D', timeZone
        );

        beforeEach(() => {
            svg = select(document.body).append('svg');
            appendAxes(svg, {
                xAxis,
                yAxis,
                secondaryYAxis: secondaryYAxis,
                layout: layout,
                yTitle: 'Label title',
                secondaryYTitle: null
            });
        });

        afterEach(() => {
            select('svg').remove();
        });

        it('axes created', () => {
            expect(xAxis).toEqual(jasmine.any(Function));
            expect(yAxis).toEqual(jasmine.any(Function));
            expect(secondaryYAxis).toBeNull();
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

        it('there is only one y-axis', () => {
            const yAxes = svg.selectAll('g.y-axis');
            expect(yAxes.size()).toEqual(1);
        });
    });

    describe('appendAxes with a secondary y-axis', () => {
        const secondaryYScale = scaleLinear().range([0, 10]).domain([30, 40]);
        let {xAxis, yAxis, secondaryYAxis} = createAxes(
            xScale, yScale, secondaryYScale, 100, '00060', 'P7D', timeZone
        );

        beforeEach(() => {
            svg = select(document.body).append('svg');
            appendAxes(svg, {
                xAxis,
                yAxis,
                secondaryYAxis: secondaryYAxis,
                layout: layout,
                yTitle: 'Label title',
                secondaryYTitle: 'Second label title'
            });
        });

        afterEach(() => {
            select('svg').remove();
        });

        it('creates all axes', () => {
            expect(xAxis).toEqual(jasmine.any(Function));
            expect(yAxis).toEqual(jasmine.any(Function));
            expect(secondaryYAxis).toEqual(jasmine.any(Function));
            expect(yAxis.tickSizeInner()).toBe(100);
            expect(secondaryYAxis.tickSizeInner()).toBe(100);
            expect(xAxis.scale()).toBe(xScale);
            expect(yAxis.scale()).toBe(yScale);
            expect(secondaryYAxis.scale()).toBe(secondaryYScale);
        });

        it('there is are two y-axes that are properly translated', () => {
            const yAxes = svg.selectAll('g.y-axis');
            expect(yAxes.size()).toEqual(2);

            let translations = [];
            svg.selectAll('.y-axis').each(function () {
                let y = select(this);
                translations.push(y.attr('transform'));
            });

            expect(translations[0]).toContain('translate(0');
            expect(translations[1]).toContain('translate(10');
        });

        it('two labels are appended', () => {
            let tspans = [];
            svg.selectAll('.y-axis-label').each(function () {
                let y = select(this);
                y.selectAll('tspan').each(function () {
                    tspans.push(this.textContent);
                });
            });
            expect(tspans[0]).toEqual('Label title');
            expect(tspans[1]).toEqual('Second label title');
        });
    });*/
});