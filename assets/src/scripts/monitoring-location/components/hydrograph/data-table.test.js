import {select} from 'd3-selection';

import {configureStore} from 'ml/store';

import {drawDataTables} from './data-table';
import {TEST_PRIMARY_IV_DATA, TEST_GW_LEVELS} from './mock-hydrograph-state';

const TEST_STATE = {
    hydrographData: {
        primaryIVData: TEST_PRIMARY_IV_DATA,
        groundwaterLevels: TEST_GW_LEVELS
    }
};

describe('monitoring-location/components/hydrograph/data-table', () => {
    let testDiv;
    let store;

    beforeEach(() => {
        testDiv = select('body').append('div');
    });

    afterEach(() => {
        testDiv.remove();
    });

    it('table with expected data', () => {
        store = configureStore({
            hydrographData: {
                primaryIVData: TEST_PRIMARY_IV_DATA,
                groundwaterLevels: TEST_GW_LEVELS
            },
            hydrographState: {
                selectedIVMethodID: '90649'
            }
        });
        drawDataTables(testDiv, store);

        const ivTable = testDiv.select('#iv-table-container').select('table');
        expect(ivTable.select('caption').text()).toBe('Instantaneous value data');
        expect(ivTable.selectAll('tr').size()).toBe(10);
        const gwTable = testDiv.select('#gw-table-container').select('table');
        expect(gwTable.select('caption').text()).toBe('Field visit data');
        expect(gwTable.selectAll('tr').size()).toBe(5);
    });

    it('Renders single IV table if no GW levels', () => {
        store = configureStore({
            hydrographData: {
                primaryIVData: TEST_PRIMARY_IV_DATA,
            },
            hydrographState: {
                selectedIVMethodID: '90649'
            }
        });
        drawDataTables(testDiv, store);

        expect(testDiv.select('#iv-table-container').size()).toBe(1);
        expect(testDiv.select('#gw-table-container').size()).toBe(0);
    });
    it('Renders single GW table if no IV data', () => {
        store = configureStore({
            hydrographData: {
                groundwaterLevels: TEST_GW_LEVELS
            }
        });
        drawDataTables(testDiv, store);

        expect(testDiv.select('#iv-table-container').size()).toBe(0);
        expect(testDiv.select('#gw-table-container').size()).toBe(1);
    });
});
