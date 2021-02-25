import {select} from 'd3-selection';

import * as utils from 'ui/utils';

import{configureStore} from 'ml/store';

import {drawGraphBrush} from './graph-brush';
import {TEST_CURRENT_TIME_RANGE, TEST_PRIMARY_IV_DATA, TEST_GW_LEVELS} from './mock-hydrograph-state';

describe ('monitoring-location/components/hydrograph/graph-brush module', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    const TEST_STATE = {
        hydrographData: {
            currentTimeRange: TEST_CURRENT_TIME_RANGE,
            primaryIVData: TEST_PRIMARY_IV_DATA,
            groundwaterLevels: TEST_GW_LEVELS
        },
        hydrographState: {
            selectedIVMethodID: '90649'
        },
        ui: {
            width: 900
        }
    };

    describe('drawGraphBrush', () => {
        let div, store;

        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore(TEST_STATE);
        });

        afterEach(() => {
            div.remove();
        });

        it('Should create a brush svg element', () => {
            div.call(drawGraphBrush, store);

            expect(div.select('svg').size()).toBe(1);
            expect(div.select('.brush').size()).toBe(1);
            expect(div.select('.overlay').size()).toBe(1);
            expect(div.select('.selection').size()).toBe(1);
            expect(div.select('.brush-text-hint').size()).toBe(1);
            expect(div.selectAll('.handle').size()).toBe(2);
            expect(div.selectAll('.handle--custom').size()).toBe(2);
            expect(div.selectAll('.tick').size()).toBe(7);
        });

        it('Should create a time-series-line, gw levels circles, and an x-axis', () => {
            div.call(drawGraphBrush, store);

            expect(div.selectAll('.ts-primary-group').size()).toBe(1);
            expect(div.selectAll('.iv-graph-gw-levels-group').size()).toBe(1);
            expect(div.selectAll('.x-axis').size()).toBe(1);
        });
    });
});