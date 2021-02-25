import {select} from 'd3-selection';
import {scaleLinear} from 'd3-scale';

import {circleMarker, textOnlyMarker} from 'd3render/markers';
import {drawGroundwaterLevels, getGroundwaterLevelsMarkers} from './discrete-data';


describe('monitoring-location/components/hydrograph/discrete-data', () => {
    describe('drawGroundwaterLevels', () => {

        let svg, gwLevels, xScale, yScale;

        beforeEach(() => {
            svg = select('body').append('svg');
            gwLevels = [
                {value: '14.0', dateTime: 1491055200000, qualifiers: ['A', '1'], approvals: {label: 'Approved', class: 'approved'}},
                {value: '14.5', dateTime: 1490882400000, qualifiers: ['P', '1'], approvals: {label: 'Provisional', class: 'provisional'}},
                {value: '13.0', dateTime: 1490536800000, qualifiers: ['R', '1'], approvals: {label: 'Revised', class: 'revised'}},
                {value: '12.0', dateTime: 1489672800000, qualifiers: ['P', '1'], approvals: {label: 'Provisional', class: 'provisional'}},
                {value: '11.0', dateTime: 1489672300000, qualifiers: ['bad approval code', '1'], approvals: {label: 'code bad approval code', class: 'unknown-code-bad approval code'}},
                {value: '13.0', dateTime: 1489672100000, qualifiers: ['1'], approvals: {label: 'code 1', class: 'unknown-code-1'}}
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
                points: gwLevels,
                xScale: xScale,
                yScale: yScale
            });
            expect(svg.selectAll('circle').size()).toBe(6);
            expect(svg.selectAll('.approved').size()).toBe(1);
            expect(svg.selectAll('.provisional').size()).toBe(2);
            expect(svg.selectAll('.revised').size()).toBe(1);
        });

        it('A second call to render with no gw points renders no circles', () => {
            drawGroundwaterLevels(svg, {
                points: gwLevels,
                xScale: xScale,
                yScale: yScale
            });
            drawGroundwaterLevels(svg, {
                points: [],
                xScale: xScale,
                yScale: yScale
            });
            expect(svg.selectAll('circle').size()).toBe(0);
        });

        describe('getGroundwaterLevelsMarker', () => {
            const groundwaterApprovals = {
                provisional: true,
                approved: false,
                revised: false
            };

            it('Expects to return a circle marker', () => {
                expect(getGroundwaterLevelsMarkers(groundwaterApprovals)[0].type).toBe(textOnlyMarker);
                expect(getGroundwaterLevelsMarkers(groundwaterApprovals)[1].type).toBe(circleMarker);
            });
        });
    });
});