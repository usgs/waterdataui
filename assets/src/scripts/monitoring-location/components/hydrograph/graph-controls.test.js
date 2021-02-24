import {select} from 'd3-selection';
import sinon from 'sinon';

import {configureStore} from 'ml/store';
import * as hydrographData from 'ml/store/hydrograph-data';

import {drawGraphControls} from './graph-controls';
import {TEST_CURRENT_TIME_RANGE} from './mock-hydrograph-state';

// Tests for the graph-controls module
describe('monitoring-location/components/hydrograph/graph-controls', () => {
    describe('drawGraphControls', () => {

        let div;
        let fakeServer;
        let store;
        let retrievePriorYearSpy, retrieveMedianStatisticsSpy;

        beforeEach(() => {
            div = select('body').append('div');
            store = configureStore({
                hydrographData: {
                    currentTimeRange: TEST_CURRENT_TIME_RANGE
                },
                hydrographState: {
                    showCompareIVData: false,
                    showMedianData: false,
                    selectedParameterCode: '72019'
                }
            });
            fakeServer = sinon.createFakeServer();
            retrievePriorYearSpy = jest.spyOn(hydrographData, 'retrievePriorYearIVData');
            retrieveMedianStatisticsSpy = jest.spyOn(hydrographData, 'retrieveMedianStatistics');

            drawGraphControls(div, store, '11112222');
        });

        afterEach(() => {
            fakeServer.restore();
            div.remove();
        });

        // last year checkbox tests
        it('Should render the compare toggle unchecked', () => {
            const checkbox = select('#last-year-checkbox');
            expect(checkbox.size()).toBe(1);
            expect(checkbox.property('checked')).toBe(false);
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
        });

        it('Changing the compare visibility back to false should set the visibility but not retrieve the Prior year data', () => {
            const checkbox = select('#last-year-checkbox');
            checkbox.property('checked', true);
            checkbox.dispatch('click');

            checkbox.property('checked', false);
            checkbox.dispatch('click');
            expect(store.getState().hydrographState.showCompareIVData).toBe(false);
            expect(retrievePriorYearSpy.mock.calls).toHaveLength(1);
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
            expect(retrieveMedianStatisticsSpy).toHaveBeenCalledWith('11112222', '72019');
        });

        it('Changing the median visibility back to false should set the visibility but not retrieve the median data', () => {
            const checkbox = select('#median-checkbox');
            checkbox.property('checked', true);
            checkbox.dispatch('click');

            checkbox.property('checked', false);
            checkbox.dispatch('click');
            expect(store.getState().hydrographState.showMedianData).toBe(false);
            expect(retrieveMedianStatisticsSpy.mock.calls).toHaveLength(1);
        });
    });
});
