import {select} from 'd3-selection';
import sinon from 'sinon';

import config from 'ui/config';
import * as utils from 'ui/utils';

import {getSelectedTimeSpan, getGraphBrushOffset} from 'ml/selectors/hydrograph-state-selector';

import {configureStore} from 'ml/store';
import * as hydrographData from 'ml/store/hydrograph-data';
import {setSelectedTimeSpan} from 'ml/store/hydrograph-state';


import {drawTimeSpanControls} from './time-span-controls';
import * as dataIndicator from './data-indicator';

const TEST_STATE = {
    hydrographState: {
        selectedTimeSpan: 'P7D',
        selectedParameterCode: '00065',
        graphBrushOffset: {
            start: 0,
            end: 10000000000
        }
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

    describe('drawTimeSpanControls', () => {
        it('Expects the time span controls to be created and initialized with the time span in the store of P7D', () => {
            drawTimeSpanControls(div, store, '12345678');

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

        it('Expects the time span controls to be initialized with the dates when timeSpan is an object', () => {
            store.dispatch(setSelectedTimeSpan({
                start: '2020-03-03',
                end: '2020-03-15'
            }));

            drawTimeSpanControls(div, store, '12345678');

            const startDateInput = div.select('#start-date');
            const endDateInput = div.select('#end-date');
            const daysBeforeTodayInput = div.select('#days-before-today');
            expect(startDateInput.size()).toBe(1);
            expect(startDateInput.attr('type')).toEqual('text');
            expect(startDateInput.property('value')).toEqual('03/03/2020');
            expect(endDateInput.size()).toBe(1);
            expect(endDateInput.attr('type')).toEqual('text');
            expect(endDateInput.property('value')).toEqual('03/15/2020');
            expect(daysBeforeTodayInput.size()).toBe(1);
            expect(daysBeforeTodayInput.attr('type')).toEqual('text');
            expect(daysBeforeTodayInput.property('value')).toEqual('');
        });
    });

    describe('Tests when clicking the button', () => {
        let button;
        beforeEach(() => {
            drawTimeSpanControls(div, store, '12345678');
            button = div.select('.usa-button');
        });

        it('Show error alert when the user clears all data', () => {
            div.select('#days-before-today').property('value', '');
            button.dispatch('click');

            const state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(1);
            expect(retrieveSpy).not.toHaveBeenCalled();
            expect(showDataIndicatorSpy).not.toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P7D');
            expect(getGraphBrushOffset(state)).not.toBeNull();
        });

        it('Do not show the alert and update the store when the user has a start date and end date', () => {
            div.select('#start-date').property('value', '02/05/2020');
            div.select('#end-date').property('value', '02/28/2020');
            button.dispatch('click');

            const state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(0);
            expect(retrieveSpy).toHaveBeenCalledWith('12345678', {
                parameterCode: '00065',
                period: null,
                startTime: '2020-02-05T00:00:00.000-06:00',
                endTime: '2020-02-28T23:59:59.999-06:00',
                loadCompare: false,
                loadMedian: false
            });
            expect(showDataIndicatorSpy).toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual({
                start: '2020-02-05',
                end: '2020-02-28'
            });
            expect(getGraphBrushOffset(state)).toBeNull();
        });

        it('Show alert when the user enters a start date but no end date', () => {
            div.select('#start-date').property('value', '02/05/2020');
            button.dispatch('click');

            const state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(1);
            expect(retrieveSpy).not.toHaveBeenCalled();
            expect(showDataIndicatorSpy).not.toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P7D');
            expect(getGraphBrushOffset(state)).not.toBeNull();
        });

        it('Show alert when the user enters a start date and invalid end date', () => {
            div.select('#start-date').property('value', '02/05/2020');
            div.select('#end-date').property('value', 'aaa');
            button.dispatch('click');

            const state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(1);
            expect(retrieveSpy).not.toHaveBeenCalled();
            expect(showDataIndicatorSpy).not.toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P7D');
            expect(getGraphBrushOffset(state)).not.toBeNull();
        });

        it('Show alert when the user enters a start date and an end date that is before start date', () => {
            div.select('#start-date').property('value', '02/05/2020');
            div.select('#end-date').property('value', '01/05/2020');
            button.dispatch('click');

            const state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(1);
            expect(retrieveSpy).not.toHaveBeenCalled();
            expect(showDataIndicatorSpy).not.toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P7D');
            expect(getGraphBrushOffset(state)).not.toBeNull();
        });

        it('Show alert when the users enter an end date but no start date', () => {
            div.select('#end-date').property('value', '01/05/2020');
            button.dispatch('click');

            const state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(1);
            expect(retrieveSpy).not.toHaveBeenCalled();
            expect(showDataIndicatorSpy).not.toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P7D');
            expect(getGraphBrushOffset(state)).not.toBeNull();
        });

        it('show alert when the user enters an invalid start date and an end date', () => {
            div.select('#start-date').property('value', 'aaa');
            div.select('#end-date').property('value', '01/05/2020');
            button.dispatch('click');

            const state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(1);
            expect(retrieveSpy).not.toHaveBeenCalled();
            expect(showDataIndicatorSpy).not.toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P7D');
            expect(getGraphBrushOffset(state)).not.toBeNull();
        });

        it('Should clear a previous alert if data is now valid', () => {
            div.select('#start-date').property('value', 'aaa');
            div.select('#end-date').property('value', '01/05/2020');
            button.dispatch('click');

            div.select('#start-date').property('value', '01/01/2020');
            button.dispatch('click');

            const state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(0);
            expect(retrieveSpy).toHaveBeenCalledWith('12345678', {
                parameterCode: '00065',
                period: null,
                startTime: '2020-01-01T00:00:00.000-06:00',
                endTime: '2020-01-05T23:59:59.999-06:00',
                loadCompare: false,
                loadMedian: false
            });
            expect(showDataIndicatorSpy).toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual({
                start: '2020-01-01',
                end: '2020-01-05'
            });
            expect(getGraphBrushOffset(state)).toBeNull();
        });

        it('Should show an alert if the days before today is not a number', () => {
            div.select('#days-before-today').property('value', 'AD');
            button.dispatch('click');

            const state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(1);
            expect(retrieveSpy).not.toHaveBeenCalled();
            expect(showDataIndicatorSpy).not.toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P7D');
            expect(getGraphBrushOffset(state)).not.toBeNull();
        });

        it('Should show an alert if the days before today is negative or zero', () => {
            div.select('#days-before-today').property('value', '-2');
            button.dispatch('click');

            let state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(1);
            expect(retrieveSpy).not.toHaveBeenCalled();
            expect(showDataIndicatorSpy).not.toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P7D');
            expect(getGraphBrushOffset(state)).not.toBeNull();

            div.select('#days-before-today').property('value', '0');
            button.dispatch('click');

            state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(1);
            expect(retrieveSpy).not.toHaveBeenCalled();
            expect(showDataIndicatorSpy).not.toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P7D');
            expect(getGraphBrushOffset(state)).not.toBeNull();
        });

        it('Should update the time span if days before today is valid', () => {
            div.select('#days-before-today').property('value', '45');
            button.dispatch('click');

            let state = store.getState();
            expect(div.select('.usa-alert--error').size()).toBe(0);
            expect(retrieveSpy).toHaveBeenCalledWith('12345678', {
                parameterCode: '00065',
                period: 'P45D',
                startTime: null,
                endTime: null,
                loadCompare: false,
                loadMedian: false
            });
            expect(showDataIndicatorSpy).toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P45D');
            expect(getGraphBrushOffset(state)).toBeNull();
        });

        it('Should clear the time span if the selected time span is changed to days before today', () => {
            const startDate = div.select('#start-date');
            const endDate = div.select('#end-date');
            startDate.property('value', '02/05/2020');
            endDate.property('value', '02/28/2020');
            store.dispatch(setSelectedTimeSpan('P30D'));

            return new Promise(resolve => {
                window.requestAnimationFrame(() =>{
                    expect(startDate.property('value')).toEqual('');
                    expect(endDate.property('value')).toEqual('');
                    resolve();
                });
            });
        });

        it('Should update the days before if selectedTimeSpan is updated to a new days before value', () => {
            store.dispatch(setSelectedTimeSpan('P30D'));
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.select('#days-before-today').property('value')).toEqual('30');
                    resolve();
                });
            });
        });
    });
});
