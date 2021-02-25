import {select, selectAll} from 'd3-selection';

import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';

import {drawTimeSeriesLegend} from './legend';
import {TEST_PRIMARY_IV_DATA, TEST_GW_LEVELS} from './mock-hydrograph-state';

describe('monitoring-location/components/hydrograph/legend module', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    const TEST_STATE = {
        hydrographData: {
            primaryIVData: TEST_PRIMARY_IV_DATA,
            groundwaterLevels: TEST_GW_LEVELS
        },
        hydrographState: {
            selectedIVMethodID: '90649'
        }
    };

    describe('legends should render', () => {

        let graphNode;
        let store;

        beforeEach(() => {
            let body = select('body');
            let component = body.append('div')
                .attr('id', 'hydrograph');
            component.append('div').attr('class', 'loading-indicator-container');
            component.append('div').attr('class', 'graph-container');
            component.append('div').attr('class', 'select-time-series-container');

            graphNode = document.getElementById('hydrograph');

            store = configureStore(TEST_STATE);
            select(graphNode)
                .call(drawTimeSeriesLegend, store);

        });

        afterEach(() => {
            select('#hydrograph').remove();
        });


        it('Should have 6 legend markers', () => {
            expect(selectAll('.legend g').size()).toBe(6);
        });
    });
});
