import {select} from 'd3-selection';
import sinon from 'sinon';

import config from 'ui/config';
import * as utils from 'ui/utils';

import {getSelectedDateRange, getSelectedCustomDateRange} from 'ml/selectors/hydrograph-state-selector';

import {configureStore} from 'ml/store';
import * as hydrographData from 'ml/store/hydrograph-data';
import * as hydrographState from 'ml/store/hydrograph-state';

import {drawDateRangeControls} from './date-controls';
import * as dataLoadingIndicator from './data-loading-indicator';

const TEST_STATE = {
    hydrographState: {
       selectedDateRange: 'P7D',
       selectedCustomDateRange: null,
       selectedParameterCode: '00065'
    }
};


describe('monitoring-location/components/hydrograph/date-controls', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    let div;
    let fakeServer;
    let store;
    let retrieveSpy;
    let loadingIndicatorSpy;
    config.locationTimeZone = 'America/Chicago';

    beforeEach(() => {
        div = select('body').append('div');
        store = configureStore(TEST_STATE);
        fakeServer = sinon.createFakeServer();
        retrieveSpy = jest.spyOn(hydrographData, 'retrieveHydrographData');
        loadingIndicatorSpy = jest.spyOn(dataLoadingIndicator, 'showDataLoadingIndicator');
    });

    afterEach(() => {
        fakeServer.restore();
        div.remove();
    });

    describe('Initial rendering', () => {
        it('Expects the date range controls to be created and initialized with the custom container hidden', () => {
            drawDateRangeControls(div, store, '12345678', 'P7D', null);

            expect(div.select('input[name="ts-daterange-input"]:checked').property('value')).toBe('P7D');
            expect(div.select('#container-radio-group-and-form-buttons').attr('hidden')).toBe('true');
        });

        it('Expects the "P30D" radio button is selected with the custom container hidden', () => {
            drawDateRangeControls(div, store, '12345678', 'P30D', null);

            expect(div.select('input[name="ts-daterange-input"]:checked').property('value')).toBe('P30D');
            expect(div.select('#container-radio-group-and-form-buttons').attr('hidden')).toBe('true');
        });

        it('Expects the "P365D" radio button is selected with the custom container hidden', () => {
            drawDateRangeControls(div, store, '12345678', 'P365D', null);

            expect(div.select('input[name="ts-daterange-input"]:checked').property('value')).toBe('P365D');
            expect(div.select('#container-radio-group-and-form-buttons').attr('hidden')).toBe('true');
        });

        it('Expects the custom radio button is selected with the custom container shown if initialDateRange is P10D', () => {
            drawDateRangeControls(div, store, '12345678', 'P10D', null);

            expect(div.select('input[name="ts-daterange-input"]:checked').property('value')).toBe('custom');
            expect(div.select('#container-radio-group-and-form-buttons').attr('hidden')).toBeNull();
            expect(div.select('input[name="ts-custom-daterange-input"]:checked').property('value')).toBe('days');
            expect(div.select('#ts-custom-days-before-today-select-container').attr('hidden')).toBeNull();
            expect(div.select('#with-hint-input-days-from-today').property('value')).toBe('10');
            expect(div.select('#ts-customdaterange-select-container').attr('hidden')).toBe('true');
        });

        it('Expects the custom radio button is selected with the custom container shown if initialDateRange is custom', () => {
            drawDateRangeControls(div, store, '12345678', 'custom', {
                start: '2020-01-03',
                end: '2020-04-15'
            });

            expect(div.select('input[name="ts-daterange-input"]:checked').property('value')).toBe('custom');
            expect(div.select('#container-radio-group-and-form-buttons').attr('hidden')).toBeNull();
            expect(div.select('input[name="ts-custom-daterange-input"]:checked').property('value')).toBe('calendar');
            expect(div.select('#ts-custom-days-before-today-select-container').attr('hidden')).toBe('true');
            expect(div.select('#ts-customdaterange-select-container').attr('hidden')).toBeNull();
            expect(div.select('#custom-start-date').property('value')).toBe('01/03/2020');
            expect(div.select('#custom-end-date').property('value')).toBe('04/15/2020');
        });
    });

    describe('Select radio button interactions', () => {
        let clearBrushOffsetSpy;
        beforeEach(() => {
            clearBrushOffsetSpy = jest.spyOn(hydrographState, 'clearGraphBrushOffset');
            drawDateRangeControls(div, store, '12345678', 'P7D', null);
        }) ;

        it('Expect change to P30D to fetch new data', () => {
            const radioButton = div.select('#P30D-input').property('checked', true);
            radioButton.dispatch('change');

            expect(div.select('#container-radio-group-and-form-buttons').attr('hidden')).toBe('true');
            expect(getSelectedDateRange(store.getState())).toEqual('P30D');
            expect(clearBrushOffsetSpy).toHaveBeenCalled();
            expect(loadingIndicatorSpy.mock.calls).toHaveLength(1);
            expect(loadingIndicatorSpy.mock.calls[0][0]).toBe(true);
            expect(retrieveSpy.mock.calls).toHaveLength(1);
            expect(retrieveSpy.mock.calls[0][0]).toEqual('12345678');
            expect(retrieveSpy.mock.calls[0][1]).toEqual({
                parameterCode: '00065',
                period: 'P30D',
                startTime: null,
                endTime: null,
                loadCompare: false,
                loadMedian: false
            });
        });

        it('Expect change to P365D to fetch new data', () => {
            const radioButton = div.select('#P365D-input').property('checked', true);
            radioButton.dispatch('change');

            expect(div.select('#container-radio-group-and-form-buttons').attr('hidden')).toBe('true');
            expect(getSelectedDateRange(store.getState())).toEqual('P365D');
            expect(clearBrushOffsetSpy).toHaveBeenCalled();
            expect(loadingIndicatorSpy.mock.calls).toHaveLength(1);
            expect(loadingIndicatorSpy.mock.calls[0][0]).toBe(true);
            expect(retrieveSpy.mock.calls).toHaveLength(1);
            expect(retrieveSpy.mock.calls[0][0]).toEqual('12345678');
            expect(retrieveSpy.mock.calls[0][1]).toEqual({
                parameterCode: '00065',
                period: 'P365D',
                startTime: null,
                endTime: null,
                loadCompare: false,
                loadMedian: false
            });
        });

        it('Expect change to custom to show the custom form but no new data is fetched', () => {
            const radioButton = div.select('#custom-input').property('checked', true);
            radioButton.dispatch('change');

            expect(div.select('#container-radio-group-and-form-buttons').attr('hidden')).toBeNull();
            expect(getSelectedDateRange(store.getState())).toEqual('P7D');
            expect(clearBrushOffsetSpy).not.toHaveBeenCalled();
            expect(loadingIndicatorSpy.mock.calls).toHaveLength(0);
            expect(retrieveSpy).not.toHaveBeenCalled();
        });

        it('Expects a change from custom to P7D to fetch new data and hide custom form', () => {
            const radioButton = div.select('#custom-input').property('checked', true);
            radioButton.dispatch('change');

            const radioButtonP7D = div.select('#P7D-input').property('checked', true);
            radioButtonP7D.dispatch('change');

            expect(div.select('#container-radio-group-and-form-buttons').attr('hidden')).toBe('true');
            expect(getSelectedDateRange(store.getState())).toEqual('P7D');
            expect(clearBrushOffsetSpy).toHaveBeenCalled();
            expect(loadingIndicatorSpy.mock.calls).toHaveLength(1);
            expect(loadingIndicatorSpy.mock.calls[0][0]).toBe(true);
            expect(retrieveSpy.mock.calls).toHaveLength(1);
            expect(retrieveSpy.mock.calls[0][0]).toEqual('12345678');
            expect(retrieveSpy.mock.calls[0][1]).toEqual({
                parameterCode: '00065',
                period: 'P7D',
                startTime: null,
                endTime: null,
                loadCompare: false,
                loadMedian: false
            });
        });
    });

    describe('Custom form interactions', () => {
        let clearBrushOffsetSpy;
        beforeEach(() => {
            clearBrushOffsetSpy = jest.spyOn(hydrographState, 'clearGraphBrushOffset');
            drawDateRangeControls(div, store, '12345678', 'P10D', null);
        });

        it('Expects that selecting the calendar days radio shows the calendar days form', () => {
            const radioButton = div.select('#calendar-input')
                .property('checked', true);
            radioButton.dispatch('change');

            expect(div.select('#ts-custom-days-before-today-select-container').attr('hidden')).toBe('true');
            expect(div.select('#ts-customdaterange-select-container').attr('hidden')).toBeNull();
        });

        it('Expects that switching back to days before shows the days before form', () => {
            let radioButton = div.select('#calendar-input').property('checked', true);
            radioButton.dispatch('change');

            radioButton = div.select('#days-input').property('checked', true);
            radioButton.dispatch('change');

            expect(div.select('#ts-custom-days-before-today-select-container').attr('hidden')).toBeNull();
            expect(div.select('#ts-customdaterange-select-container').attr('hidden')).toBe('true');
        });

        it('Expects updating the days before and clicking Submit updates the store and retrieves data', () => {
            div.select('#with-hint-input-days-from-today').property('value', '45');
            const submitButton = div.select('#custom-date-submit-days');
            submitButton.dispatch('click');

            expect(clearBrushOffsetSpy).toHaveBeenCalled();
            expect(getSelectedDateRange(store.getState())).toEqual('P45D');
            expect(loadingIndicatorSpy.mock.calls).toHaveLength(1);
            expect(loadingIndicatorSpy.mock.calls[0][0]).toBe(true);
            expect(retrieveSpy.mock.calls[0][0]).toEqual('12345678');
            expect(retrieveSpy.mock.calls[0][1]).toEqual({
                parameterCode: '00065',
                period: 'P45D',
                startTime: null,
                endTime: null,
                loadCompare: false,
                loadMedian: false
            });
        });

        it('Expects an warning to show if the days input is invalid', () => {
            div.select('#with-hint-input-days-from-today').property('value', '45 days');
            const submitButton = div.select('#custom-date-submit-days');
            submitButton.dispatch('click');

            expect(div.select('#custom-days-before-today-alert-container').attr('hidden')).toBeNull();
            expect(clearBrushOffsetSpy).not.toHaveBeenCalled();
            expect(getSelectedDateRange(store.getState())).toEqual('P7D');
            expect(loadingIndicatorSpy.mock.calls).toHaveLength(0);
            expect(retrieveSpy).not.toHaveBeenCalled();
        });

        it('Expect submitting calendar times sets the date range to custom and saves the time range', () => {
            let radioButton = div.select('#calendar-input').property('checked', true);
            radioButton.dispatch('change');

            div.select('#custom-start-date').property('value', '01/03/2020');
            div.select('#custom-end-date').property('value', '01/16/2020');
            const submitButton = div.select('#custom-date-submit-calendar');
            submitButton.dispatch('click');

            expect(getSelectedDateRange(store.getState())).toEqual('custom');
            expect(getSelectedCustomDateRange(store.getState())).toEqual({
                start: '2020-01-03',
                end: '2020-01-16'
            });
            expect(clearBrushOffsetSpy).toHaveBeenCalled();
            expect(loadingIndicatorSpy.mock.calls).toHaveLength(1);
            expect(loadingIndicatorSpy.mock.calls[0][0]).toBe(true);
            expect(retrieveSpy.mock.calls).toHaveLength(1);
            expect(retrieveSpy.mock.calls[0][0]).toEqual('12345678');
            expect(retrieveSpy.mock.calls[0][1]).toEqual({
                parameterCode: '00065',
                period: null,
                startTime: '2020-01-03T00:00:00.000-06:00',
                endTime: '2020-01-16T23:59:59.999-06:00',
                loadCompare: false,
                loadMedian: false
            });
        });

        it('Show validation error container if start date is missing', () => {
            let radioButton = div.select('#calendar-input').property('checked', true);
            radioButton.dispatch('change');

            div.select('#custom-end-date').property('value', '01/16/2020');
            const submitButton = div.select('#custom-date-submit-calendar');
            submitButton.dispatch('click');

            expect(div.select('#custom-date-alert-container').attr('hidden')).toBeNull();
            expect(getSelectedDateRange(store.getState())).toEqual('P7D');
            expect(getSelectedCustomDateRange(store.getState())).toBeNull();
            expect(clearBrushOffsetSpy).not.toHaveBeenCalled();
            expect(loadingIndicatorSpy.mock.calls).toHaveLength(0);
            expect(retrieveSpy).not.toHaveBeenCalled();
        });

        it('Show validation error container if end date is missing', () => {
            let radioButton = div.select('#calendar-input').property('checked', true);
            radioButton.dispatch('change');

            div.select('#custom-start-date').property('value', '01/03/2020');
            const submitButton = div.select('#custom-date-submit-calendar');
            submitButton.dispatch('click');

            expect(div.select('#custom-date-alert-container').attr('hidden')).toBeNull();
            expect(getSelectedDateRange(store.getState())).toEqual('P7D');
            expect(getSelectedCustomDateRange(store.getState())).toBeNull();
            expect(clearBrushOffsetSpy).not.toHaveBeenCalled();
            expect(loadingIndicatorSpy.mock.calls).toHaveLength(0);
            expect(retrieveSpy).not.toHaveBeenCalled();
        });

        it('Show validation error container if start date is after end date', () => {
            let radioButton = div.select('#calendar-input').property('checked', true);
            radioButton.dispatch('change');

            div.select('#custom-start-date').property('value', '01/03/2020');
            div.select('#custom-end-date').property('value', '12/26/2019');
            const submitButton = div.select('#custom-date-submit-calendar');
            submitButton.dispatch('click');

            expect(div.select('#custom-date-alert-container').attr('hidden')).toBeNull();
            expect(getSelectedDateRange(store.getState())).toEqual('P7D');
            expect(getSelectedCustomDateRange(store.getState())).toBeNull();
            expect(clearBrushOffsetSpy).not.toHaveBeenCalled();
            expect(loadingIndicatorSpy.mock.calls).toHaveLength(0);
            expect(retrieveSpy).not.toHaveBeenCalled();
        });
    });
});
