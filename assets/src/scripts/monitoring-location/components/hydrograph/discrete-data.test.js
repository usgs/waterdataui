import {select} from 'd3-selection';
import {scaleLinear} from 'd3-scale';

import {drawGroundwaterLevels} from './discrete-data';


describe('monitoring-location/components/hydrograph/discrete-data', () => {
    describe('drawGroundwaterLevels', () => {

        let svg, gwLevels, xScale, yScale;

        beforeEach(() => {
            svg = select('body').append('svg');
            gwLevels = [
                {value: '14.0', dateTime: 1491055200000, label: 'Approved', classes: ['gw-class', 'approved'], radius: 5},
                {value: '14.5', dateTime: 1490882400000, label: 'Provisional', classes: ['gw-class', 'provisional'], radius: 5},
                {value: '13.0', dateTime: 1490536800000, label: 'Revised', classes: ['gw-class', 'revised'], radius: 5},
                {value: '12.0', dateTime: 1489672800000, label: 'Provisional', classes: ['gw-class', 'provisional'], radius: 5},
                {value: '11.0', dateTime: 1489672300000, label: 'Provisional', classes: ['gw-class', 'provisional'], radius: 5},
                {value: '13.0', dateTime: 1489672100000, label: 'Provisional', classes: ['gw-class', 'provisional'], radius: 5}
            ];
            xScale = scaleLinear()
                .range([0, 100])
                .domain([1489000000000, 1500000000000]);
            yScale = scaleLinear()
                .range([0, 100])
                .domain([11.0, 15.0]);
        });

        afterEach(() => {
            svg.remove();
        });

        it('Renders correct number of circles with correct class for each gw level', () => {
            drawGroundwaterLevels(svg, {
                levels: gwLevels,
                xScale: xScale,
                yScale: yScale
            });
            expect(svg.selectAll('circle').size()).toBe(6);
            expect(svg.selectAll('.approved').size()).toBe(1);
            expect(svg.selectAll('.provisional').size()).toBe(4);
            expect(svg.selectAll('.revised').size()).toBe(1);
        });

        it('A second call to render with no gw points renders no circles', () => {
            drawGroundwaterLevels(svg, {
                levels: gwLevels,
                xScale: xScale,
                yScale: yScale
            });
            drawGroundwaterLevels(svg, {
                levels: [],
                xScale: xScale,
                yScale: yScale
            });
            expect(svg.selectAll('circle').size()).toBe(0);
        });
    });
});