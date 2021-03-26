import {select} from 'd3-selection';
import sinon from 'sinon';

import config from 'ui/config';
import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';
import * as hydrographData from 'ml/store/hydrograph-data';
import {setSelectedTimeSpan} from 'ml/store/hydrograph-state';

import * as dataIndicator from './data-indicator';
import {drawGraphControls} from './graph-controls';
import {TEST_CURRENT_TIME_RANGE} from './mock-hydrograph-state';

// Tests for the graph-controls module
describe('monitoring-location/components/hydrograph/graph-controls', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);
    config.ivPeriodOfRecord = {
        '72019': {}
    };

    describe('drawGraphControls', () => {

        let div;
        let fakeServer;
        let store;
        let retrievePriorYearSpy, retrieveMedianStatisticsSpy;
        let showDataIndicatorSpy;

        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore({
                hydrographData: {
                    currentTimeRange: TEST_CURRENT_TIME_RANGE
                },
                hydrographState: {
                    showCompareIVData: false,
                    selectedTimeSpan: 'P7D',
                    showMedianData: false,
                    selectedParameterCode: '72019'
                }
            });
            fakeServer = sinon.createFakeServer();
            retrievePriorYearSpy = jest.spyOn(hydrographData, 'retrievePriorYearIVData');
            retrieveMedianStatisticsSpy = jest.spyOn(hydrographData, 'retrieveMedianStatistics');
            showDataIndicatorSpy = jest.spyOn(dataIndicator, 'showDataIndicators');

            drawGraphControls(div, store, '11112222');
        });

        afterEach(() => {
            fakeServer.restore();
            div.remove();
        });

        // last year checkbox tests
        it('Should render the compare toggle unchecked and not disabled', () => {
            const checkbox = select('#last-year-checkbox');
            expect(checkbox.size()).toBe(1);
            expect(checkbox.property('checked')).toBe(false);
            expect(checkbox.attr('disabled')).toBeNull();
        });

        it('Should set the compare visibility to true and retrieve the Prior year data', () => {
            const checkbox = select('#last-year-checkbox');
            checkbox.property('checked', true);
            checkbox.dispatch('click');

            expect(store.getState().hydrographState.showCompareIVData).toBe(true);
            expect(retrievePriorYearSpy).toHaveBeenCalledWith('11112222', {
                parameterCode: '72019',
                startTime: TEST_CURRENT_TIME_RANGE.start,
                endTime: TEST_CURRENT_TIME_RANGE.end
            });
            expect(showDataIndicatorSpy.mock.calls).toHaveLength(1);
            expect(showDataIndicatorSpy.mock.calls[0][0]).toBe(true);
        });

        it('Changing the compare visibility back to false should set isLoading to false so that the no data available indicator can be set,  but not retrieve the Prior year data', () => {
            const checkbox = select('#last-year-checkbox');
            checkbox.property('checked', true);
            checkbox.dispatch('click');

            checkbox.property('checked', false);
            checkbox.dispatch('click');
            expect(store.getState().hydrographState.showCompareIVData).toBe(false);
            expect(retrievePriorYearSpy.mock.calls).toHaveLength(1);
            expect(showDataIndicatorSpy.mock.calls).toHaveLength(2);
            expect(showDataIndicatorSpy.mock.calls[1][0]).toBe(false);
        });

        it('Should change the checkbox to disabled if the selectedTimeSpan is set is a date range', () => {
            store.dispatch(setSelectedTimeSpan({
                start: '2020-02-05',
                end: '2020-02-10'
            }));
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    const checkbox = select('#last-year-checkbox');
                    expect(checkbox.attr('disabled')).toBe('true');

                    resolve();
                });
            });
        });

        it('Should change the checkbox to disabled if the selectedTimeSpan is a custom period', () => {
            store.dispatch(setSelectedTimeSpan('P45D'));
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    const checkbox = select('#last-year-checkbox');
                    expect(checkbox.attr('disabled')).toBe('true');

                    resolve();
                });
            });
        });

        //median visibility tests
        it('Should render the median toggle unchecked', () => {
            const checkbox = select('#median-checkbox');
            expect(checkbox.size()).toBe(1);
            expect(checkbox.property('checked')).toBe(false);
        });

        it('Should set the median visibility to true and retrieve the median statistics data', () => {
            const checkbox = select('#median-checkbox');
            checkbox.property('checked', true);
            checkbox.dispatch('click');

            expect(store.getState().hydrographState.showMedianData).toBe(true);
            expect(showDataIndicatorSpy.mock.calls).toHaveLength(1);
            expect(showDataIndicatorSpy.mock.calls[0][0]).toBe(true);
            expect(retrieveMedianStatisticsSpy).toHaveBeenCalledWith('11112222', '72019');
        });

        it('Changing the median visibility back to false should set isLoading to false to check for no data availability', () => {
            const checkbox = select('#median-checkbox');
            checkbox.property('checked', true);
            checkbox.dispatch('click');

            checkbox.property('checked', false);
            checkbox.dispatch('click');
            expect(store.getState().hydrographState.showMedianData).toBe(false);
            expect(showDataIndicatorSpy.mock.calls).toHaveLength(2);
            expect(showDataIndicatorSpy.mock.calls[1][0]).toBe(false);
            expect(retrieveMedianStatisticsSpy.mock.calls).toHaveLength(1);
        });
    });
});
