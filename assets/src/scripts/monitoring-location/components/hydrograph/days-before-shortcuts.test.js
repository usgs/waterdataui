import {select} from 'd3-selection';
import sinon from 'sinon';

import config from 'ui/config';
import * as utils from 'ui/utils';

import {getSelectedTimeSpan, getGraphBrushOffset} from 'ml/selectors/hydrograph-state-selector';

import {configureStore} from 'ml/store';
import * as hydrographData from 'ml/store/hydrograph-data';
import {setSelectedTimeSpan} from 'ml/store/hydrograph-state';

import {drawShortcutDaysBeforeButtons} from './days-before-shortcuts';
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

describe('monitoring-location/components/hydrograph/days-before-shortcuts', () => {
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

    describe('drawShortcutDaysBeforeButtons', () => {
        it('Expects to render the shortcut radio buttons and check the 7 day radio button', () => {
            drawShortcutDaysBeforeButtons(div, store, '11112222');
            const radio7Day = div.select('#P7D-input');
            const radio30Day = div.select('#P30D-input');
            const radio1Year = div.select('#P365D-input');

            expect(radio7Day.attr('type')).toBe('radio');
            expect(radio7Day.property('checked')).toBe(true);

            expect(radio30Day.attr('type')).toBe('radio');
            expect(radio30Day.property('checked')).toBe(false);

            expect(radio1Year.attr('type')).toBe('radio');
            expect(radio1Year.property('checked')).toBe(false);
        });

        it('Expects that if the selectedTimeSpan is changed to a days before that is not a shortcut, they are all unset', () => {
            drawShortcutDaysBeforeButtons(div, store, '11112222');
            store.dispatch(setSelectedTimeSpan('P45D'));
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    const radio7Day = div.select('#P7D-input');
                    const radio30Day = div.select('#P30D-input');
                    const radio1Year = div.select('#P365D-input');
                    expect(radio7Day.property('checked')).toBe(false);
                    expect(radio30Day.property('checked')).toBe(false);
                    expect(radio1Year.property('checked')).toBe(false);
                resolve();
                });
            });
        });

        it('Expects that if the selectedTimeSpan is changed to a date range, the shortcut radio buttons are not checked', () => {
            drawShortcutDaysBeforeButtons(div, store, '11112222');
            store.dispatch(setSelectedTimeSpan({start: '2020-01-03', end: '2020-05-01'}));
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    const radio7Day = div.select('#P7D-input');
                    const radio30Day = div.select('#P30D-input');
                    const radio1Year = div.select('#P365D-input');
                    expect(radio7Day.property('checked')).toBe(false);
                    expect(radio30Day.property('checked')).toBe(false);
                    expect(radio1Year.property('checked')).toBe(false);
                    resolve();
                });
            });
        });

        it('Expects that clicking a radio button updates the selectedTimeSpan and retrieve the data', () => {
            drawShortcutDaysBeforeButtons(div, store, '11112222');
            const radio30Day = div.select('#P30D-input');
            radio30Day.property('checked', true);
            radio30Day.dispatch('click');

            let state = store.getState();
            expect(retrieveSpy).toHaveBeenCalledWith('11112222', {
                parameterCode: '00065',
                period: 'P30D',
                startTime: null,
                endTime: null,
                loadCompare: false,
                loadMedian: false
            });
            expect(showDataIndicatorSpy).toHaveBeenCalled();
            expect(getSelectedTimeSpan(state)).toEqual('P30D');
            expect(getGraphBrushOffset(state)).toBeNull();
        });
    });
});