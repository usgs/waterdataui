import {select} from 'd3-selection';

import {configureStore} from 'ml/store';

import * as utils from 'ui/utils';

import {showDataIndicators} from './data-indicator';
import {TEST_PRIMARY_IV_DATA} from './mock-hydrograph-state';

describe('monitoring-location/components/hydrograph/data-loading-indicator', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    let div;
    let store;
    beforeEach(() => {
        div = select('body').append('div');
        div.append('div')
            .attr('id', 'hydrograph-loading-indicator-container');
        div.append('div')
            .attr('id', 'hydrograph-no-data-overlay');
        store = configureStore({
            hydrographData: {
                primaryIVData: TEST_PRIMARY_IV_DATA
            },
            hydrographState: {
                selectedIVMethodID: '90649'
            }
        });
    });

    afterEach(() => {
        div.remove();
    });

    it('Renders a visible loading indicator with transform appropriately set', () => {
        store = configureStore({
            hydrographData: {
                primaryIVData: TEST_PRIMARY_IV_DATA
            },
            hydrographState: {
                selectedIVMethodID: '90649'
            }
        });
        showDataIndicators(true, store);
        expect(div.select('.loading-indicator').size()).toBe(1);
        expect(div.select('#hydrograph-loading-indicator-container').style('transform')).toBeDefined();
    });

    it('Removes a visible loading indicator when isLoading is false', () => {
        store = configureStore({
            hydrographData: {
                primaryIVData: TEST_PRIMARY_IV_DATA
            },
            hydrographState: {
                selectedIVMethodID: '90649'
            }
        });
        showDataIndicators(true, store);
        showDataIndicators(false, store);
        expect(div.select('.loading-indicator').size()).toBe(0);
    });

    it('Shows a no data notification if the store contains no visible data', () => {
        store = configureStore({
            hydrographData: {},
            hydrographState: {}
        });
        showDataIndicators(false, store);
        expect(select('#hydrograph-no-data-overlay div').size()).toBe(1);
    });

    it('Does not show a no data notification if the store contains data', () => {
        store = configureStore({
            hydrographData: {
                primaryIVData: TEST_PRIMARY_IV_DATA
            },
            hydrographState: {
                selectedIVMethodID: '90649'
            }
        });
        showDataIndicators(false, store);
        expect(select('#hydrograph-no-data-overlay div').size()).toBe(0);
    });
});