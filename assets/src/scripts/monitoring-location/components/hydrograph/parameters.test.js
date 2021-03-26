import {select} from 'd3-selection';
import sinon from 'sinon';
import config from 'ui/config';

import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';
import * as hydrographData from 'ml/store/hydrograph-data';

import * as dataIndicator from './data-indicator';
import {TEST_HYDROGRAPH_PARAMETERS} from './mock-hydrograph-state';
import {drawSelectionList} from './parameters';

describe('monitoring-location/components/hydrograph/parameters module', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    const TEST_STATE = {
       hydrographParameters: TEST_HYDROGRAPH_PARAMETERS,
       hydrographState: {
           selectedDateRange: 'P7D',
           selectedParameterCode: '72019'
       }
    };

    config.ivPeriodOfRecord = {
        '00060': {
            begin_date: '1980-01-01',
            end_date: '2020-01-01'
        },
        '72019': {
            begin_date: '1980-04-01',
            end_date: '2020-04-01'
        },
        '00010': {
            begin_date: '1981-04-01',
            end_date: '2019-04-01'
        }

    };
    config.gwPeriodOfRecord = {
        '72019': {
            begin_date: '1980-03-31',
            end_date: '2020-03-31'
        },
        '62610': {
            begin_date: '1980-05-01',
            end_date: '2020-05-01'
        }
    };

    let div;
    let fakeServer;
    let store;
    let retrieveHydrographDataSpy;
    let showDataIndicatorSpy;

    beforeEach(() => {
        div = select('body').append('div');
        fakeServer = sinon.createFakeServer();
        retrieveHydrographDataSpy = jest.spyOn(hydrographData, 'retrieveHydrographData');
        showDataIndicatorSpy = jest.spyOn(dataIndicator, 'showDataIndicators');
    });

    afterEach(() => {
        fakeServer.restore();
        div.remove();
    });

    it('If no parameters defined the element is not rendered', () => {
        store = configureStore({
            hydrographParameters: {}
        });
        drawSelectionList(div, store, '11112222');
        expect(div.select('#select-time-series').size()).toBe(0);
    });

    it('Expects the selection list to be rendered with the appropriate rows and selection', () => {
        store = configureStore(TEST_STATE);
        drawSelectionList(div, store, '11112222');

        const container = div.select('#select-time-series');
        expect(container.size()).toBe(1);
        expect(container.selectAll('.grid-row-container-row').size()).toBe(5);
        expect(container.selectAll('.expansion-toggle').size()).toBe(8); // Note - there are two for each parameter with expansion rows
        expect(container.select('input:checked').attr('value')).toEqual('72019');
    });

    it('Expects changing the selection retrieves hydrograph data', () => {
        store = configureStore(TEST_STATE);
        drawSelectionList(div, store, '11112222');

        const rowOne = div.select('#container-row-00060');
        rowOne.dispatch('click');

        expect(store.getState().hydrographState.selectedParameterCode).toEqual('00060');
        expect(showDataIndicatorSpy.mock.calls).toHaveLength(1);
        expect(showDataIndicatorSpy.mock.calls[0][0]).toBe(true);
        expect(retrieveHydrographDataSpy).toHaveBeenCalledWith('11112222', {
            parameterCode: '00060',
            period: 'P7D',
            startTime: null,
            endTime: null,
            loadCompare: false,
            loadMedian: false
        });
    });

    it('Expects clicking on a row will expand and contact the correct rows', function() {
        store = configureStore(TEST_STATE);
        drawSelectionList(div, store, '11112222');

        const firstTargetRow = div.select('#container-row-00010');
        const secondTargetRow = div.select('#container-row-72019');
        expect(select('#expansion-container-row-00010').attr('hidden')).toBe('true');
        expect(select('#expansion-container-row-72019').attr('hidden')).toBe('true');
        firstTargetRow.dispatch('click');
        expect(select('#expansion-container-row-00010').attr('hidden')).toBe(null);
        expect(select('#expansion-container-row-72019').attr('hidden')).toBe('true');
        secondTargetRow.dispatch('click');
        expect(select('#expansion-container-row-00010').attr('hidden')).toBe('true');
        expect(select('#expansion-container-row-72019').attr('hidden')).toBe(null);
    });

    it('Expects clicking the row toggle will expand the correct row and set the toggle', function() {
        store = configureStore(TEST_STATE);
        drawSelectionList(div, store, '11112222');

        const firstToggleTarget = div.select('#expansion-toggle-desktop-00010');
        const secondToggleTarget = div.select('#expansion-toggle-desktop-72019');
        expect(firstToggleTarget.attr('aria-expanded')).toBe('false');
        expect(select('#expansion-container-row-00010').attr('hidden')).toBe('true');
        expect(select('#expansion-container-row-72019').attr('hidden')).toBe('true');
        firstToggleTarget.dispatch('click');
        expect(firstToggleTarget.attr('aria-expanded')).toBe('true');
        expect(select('#expansion-container-row-00010').attr('hidden')).toBe(null);
        expect(select('#expansion-container-row-72019').attr('hidden')).toBe('true');
        secondToggleTarget.dispatch('click');
        expect(secondToggleTarget.attr('aria-expanded')).toBe('true');
        expect(select('#expansion-container-row-00010').attr('hidden')).toBe('true');
        expect(select('#expansion-container-row-72019').attr('hidden')).toBe(null);
        secondToggleTarget.dispatch('click'); // click same target a second time
        expect(secondToggleTarget.attr('aria-expanded')).toBe('false');
        expect(select('#expansion-container-row-00010').attr('hidden')).toBe('true');
        expect(select('#expansion-container-row-72019').attr('hidden')).toBe('true');
    });
});
