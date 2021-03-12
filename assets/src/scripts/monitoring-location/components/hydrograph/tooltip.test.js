import {select} from 'd3-selection';

import config from 'ui/config';
import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';

import {drawTooltipText, drawTooltipFocus, drawTooltipCursorSlider} from './tooltip';
import {TEST_GW_LEVELS, TEST_PRIMARY_IV_DATA, TEST_CURRENT_TIME_RANGE} from "./mock-hydrograph-state";

describe('monitoring-location/components/hydrograph/tooltip module', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);
    config.locationTimeZone = 'America/Chicago';
    const TEST_STATE = {
        hydrographData: {
            primaryIVData: TEST_PRIMARY_IV_DATA,
            groundwaterLevels: TEST_GW_LEVELS,
            currentTimeRange: TEST_CURRENT_TIME_RANGE
        },
        hydrographState: {
            selectedIVMethodID: '90649',
            graphCursorOffset: 500000
        },
        ui: {
            windowWidth: 1300,
            width: 990
        }
    };

    describe('drawTooltipText', () => {
        let div;
        let store;
        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore(TEST_STATE);
        });

        afterEach(() => {
            div.remove();
        });

        it('Creates the container for tooltips', () => {
            div.call(drawTooltipText, store);

            const textGroup = div.selectAll('.tooltip-text-group');
            expect(textGroup.size()).toBe(1);
        });

        it('Creates the text elements with the label for the focus times', () => {
            div.call(drawTooltipText, store);
            let value = div.select('.primary-tooltip-text').text().split(' - ')[0];
            expect(value).toBe('24.1 ft');

            expect(div.select('.compare-tooltip-text').size()).toBe(0);

            value = div.select('.gw-level-point').text().split(' - ')[0];
            expect(value).toBe('27.2 ft');
        });
    });
    describe('createTooltipFocus', () => {
        let svg;
        beforeEach(() => {
            svg = select('body').append('svg');
        });

        afterEach(() => {
            svg.remove();
        });

        it('Creates focus lines and focus circles when cursor not set', () => {
            let store = configureStore(TEST_STATE);

            svg.call(drawTooltipFocus, store);

            expect(svg.selectAll('.focus-line').size()).toBe(1);
            expect(svg.selectAll('.focus-circle').size()).toBe(2);
            expect(svg.select('.focus-overlay').size()).toBe(1);
        });
    });

    describe('drawTooltipCursorSlider', () => {
        let div;
        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        it('should render the cursor slider', () => {
            let store = configureStore(TEST_STATE);
            drawTooltipCursorSlider(div, store);

            const sliderSvg = div.selectAll('.cursor-slider-svg');
            const slider = sliderSvg.selectAll('.slider');

            expect(sliderSvg.size()).toBe(1);
            expect(slider.size()).toBe(1);
        });
    });
});
