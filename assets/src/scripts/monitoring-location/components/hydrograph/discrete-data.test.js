import {select} from 'd3-selection';
import {scaleLinear} from 'd3-scale';

import {circleMarker} from 'd3render/markers';
import {drawGroundwaterLevels, getGroundwaterLevelsMarker} from './discrete-data';

describe('monitoring-location/components/hydrograph/discrete-data', () => {
    describe('drawGroundwaterLevels', () => {

        let svg, gwLevels, xScale, yScale;

        beforeEach(() => {
            svg = select('body').append('svg');
            gwLevels = [
                {value: '14.0', dateTime: 1491055200000, qualifiers: ['A', '1']},
                {value: '14.5', dateTime: 1490882400000, qualifiers: ['P', '1']},
                {value: '13.0', dateTime: 1490536800000, qualifiers: ['R', '1']},
                {value: '12.0', dateTime: 1489672800000, qualifiers: ['P', '1']},
                {value: '11.0', dateTime: 1489672300000, qualifiers: ['bad approval code', '1']},
                {value: '13.0', dateTime: 1489672100000, qualifiers: ['1']}
            ];
            xScale = scaleLinear()
                .domain([0, 100])
                .range([1489000000000, 1500000000000]);
            yScale = scaleLinear()
                .domain([0, 100])
                .range([11.0, 15.0]);
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
            expect(svg.selectAll('.provisional').size()).toBe(2);
            expect(svg.selectAll('.revised').size()).toBe(1);
            expect(svg.selectAll('.unknown-code').size()).toBe(2);
        });

        it('A second call to render with no gw levels renders no circles', () => {
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

        describe('getGroundwaterLevelsMarker', () => {
            it('Expects to return a circle marker', () => {
                expect(getGroundwaterLevelsMarker().type).toBe(circleMarker);
            });
        });
    });
});