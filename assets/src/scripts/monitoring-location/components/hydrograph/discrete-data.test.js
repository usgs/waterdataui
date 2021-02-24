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
                {value: '14.0', dateTime: 1491055200000},
                {value: '14.5', dateTime: 1490882400000},
                {value: '13.0', dateTime: 1490536800000},
                {value: '12.0', dateTime: 1489672800000}
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

        // it('Renders 4 circles for each gw level', () => {
        //     drawGroundwaterLevels(svg, {
        //         levels: gwLevels,
        //         xScale: xScale,
        //         yScale: yScale
        //     });
        //     expect(svg.selectAll('circle').size()).toBe(4);
        // });

        // it('A second call to render with no gw levels renders no circles', () => {
        //     drawGroundwaterLevels(svg, {
        //         levels: gwLevels,
        //         xScale: xScale,
        //         yScale: yScale
        //     });
        //     drawGroundwaterLevels(svg, {
        //         levels: [],
        //         xScale: xScale,
        //         yScale: yScale
        //     });
        //     expect(svg.selectAll('circle').size()).toBe(0);
        // });

        describe('getGroundwaterLevelsMarker', () => {
            it('Expects to return a circle marker', () => {
                expect(getGroundwaterLevelsMarker().type).toBe(circleMarker);
            });
        });
    });
});