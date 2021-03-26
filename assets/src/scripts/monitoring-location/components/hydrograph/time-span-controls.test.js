import {select} from 'd3-selection';
import sinon from 'sinon';

import config from 'ui/config';
import * as utils from 'ui/utils';

import {getSelectedTimeSpan} from 'ml/selectors/hydrograph-state-selector';

import {configureStore} from 'ml/store';
import * as hydrographData from 'ml/store/hydrograph-data';

import {drawDateRangeControls} from './date-controls';
import * as dataIndicator from './data-indicator';

const TEST_STATE = {
    hydrographState: {
       selectedTimeSpan: 'P7D',
       selectedParameterCode: '00065'
    }
};


describe('monitoring-location/components/hydrograph/time-span-controls', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    let div;
    let fakeServer;
    let store;
    let retrieveSpy;
    let showDataIndicatorSpy;
    config.locationTimeZone = 'America/Chicago';

    beforeEach(() => {
        div = select('body').append('div');
        store = configureStore(TEST_STATE);
        fakeServer = sinon.createFakeServer();
        retrieveSpy = jest.spyOn(hydrographData, 'retrieveHydrographData');
        showDataIndicatorSpy = jest.spyOn(dataIndicator, 'showDataIndicators');
    });

    afterEach(() => {
        fakeServer.restore();
        div.remove();
    });

    describe('drawTimeSpanControls initial rendering', () => {
        it('Expects the time span controls to be created and initialized with the time span in the store of P7D', () => {
            drawDateRangeControls(div, store, '12345678');

            const startDateInput = div.select('#start-date');
            const endDateInput = div.select('#end-date');
            const daysBeforeTodayInput = div.select('#days-before-today');
            expect(startDateInput.size()).toBe(1);
            expect(startDateInput.attr('type')).toEqual('text');
            expect(startDateInput.property('value')).toEqual('');
            expect(endDateInput.size()).toBe(1);
            expect(endDateInput.attr('type')).toEqual('text');
            expect(endDateInput.property('value')).toEqual('');
            expect(daysBeforeTodayInput.size()).toBe(1);
            expect(daysBeforeTodayInput.attr('type')).toEqual('text');
            expect(daysBeforeTodayInput.property('value')).toEqual('7');
        });

    });
});
