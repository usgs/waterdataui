import {select} from 'd3-selection';
import {scaleLinear} from 'd3-scale';

import {drawFloodLevelLines} from './flood-level-lines';

describe('monitoring-location/components/hydrograph/flood-level-lines', () => {
    let svg;
    beforeEach(() => {
        svg = select('body').append('svg')
    });

    afterEach(() => {
        svg.remove();
    });
    describe('drawFloodLevelLines', () => {
        let xscale, yscale;
        const TEST_LEVELS = [
            {value: 5, label: 'Action stage', class: 'action-stage'},
            {value: 10, label: 'Flood stage', class: 'flood-stage'},
            {value: 12, label: 'Moderate flood stage', class: 'moderate-flood-stage'},
            {value: 14, label: 'Major flood stage', class: 'major-flood-stage'}
        ];
        beforeEach(() => {
            xscale = scaleLinear()
                .domain([1489000000000, 1500000000000])
                .range([0, 100]);
            yscale = scaleLinear()
                .domain([4, 11.5])
                .range([0, 100]);
        });

        it('Does not render the flood levels if not visible', () => {
            drawFloodLevelLines(svg, {
                visible: false,
                xscale,
                yscale,
                floodLevels: TEST_LEVELS
            });
            const group = svg.select('#flood-level-points');
            expect(group.select('g').size()).toBe(0);
        });

        it('Does not render flood levels if none are defined', () => {
            drawFloodLevelLines(svg, {
                visible: true,
                xscale,
                yscale,
                floodLevels: []
            });
            const group = svg.select('#flood-level-points');
            expect(group.select('g').size()).toBe(0);
        });

        it('Renders visible flood levels', () => {
            drawFloodLevelLines(svg, {
                visible: true,
                xscale,
                yscale,
                floodLevels: TEST_LEVELS
            });
            const group = svg.select('#flood-level-points');
            expect(group.select('.action-stage').size()).toBe(1);
            expect(group.select('.flood-stage').size()).toBe(1);
            expect(group.select('.moderate-flood-stage').size()).toBe(0);
            expect(group.select('.major-flood-stage').size()).toBe(0);
        });

        it('Will remove flood levels if no longer visible', () => {
            drawFloodLevelLines(svg, {
                visible: true,
                xscale,
                yscale,
                floodLevels: TEST_LEVELS
            });
            drawFloodLevelLines(svg, {
                visible: false,
                xscale,
                yscale,
                floodLevels: TEST_LEVELS
            });

            const group = svg.select('#flood-level-points');
            expect(group.select('g').size()).toBe(0);
        });
    });
});