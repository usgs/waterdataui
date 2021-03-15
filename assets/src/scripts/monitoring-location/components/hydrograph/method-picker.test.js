import {select} from 'd3-selection';

import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';

import * as dataIndicator from './data-indicator';
import {drawMethodPicker} from './method-picker';
import {TEST_PRIMARY_IV_DATA} from './mock-hydrograph-state';

describe('monitoring-location/components/hydrograph/method-picker', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    describe('drawMethodPicker', () => {
        const TEST_STATE = {
            hydrographData: {
                primaryIVData: TEST_PRIMARY_IV_DATA
            },
            hydrographState: {
                selectedIVMethodID: '252055'
            }
        };
        let div;
        let showDataIndicatorSpy;
        beforeEach(() => {
            div = select('body').append('div');
            showDataIndicatorSpy = jest.spyOn(dataIndicator, 'showDataIndicators');
        });

        afterEach(() => {
            div.remove();
        });

        it('Creates a picker and sets the currentMethodID to the hydrographState\'s selectedIVMethodID', () => {
            let store = configureStore(TEST_STATE);
            div.call(drawMethodPicker, store);

            expect(div.select('#ts-method-select-container').attr('hidden')).toBeNull();
            expect(div.select('select').property('value')).toEqual('252055');
        });

        it('Creates a picker and if selectedIVMethodID not set set to the preferred method id', () => {
            let store = configureStore({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    selectedIVMethodID: null
                }
            });
            div.call(drawMethodPicker, store);

            expect(div.select('#ts-method-select-container').attr('hidden')).toBeNull();
            expect(div.select('select').property('value')).toEqual('90649');
        });

        it('selecting a different method updates the store and updates the no data available indicator', () => {
            let store = configureStore(TEST_STATE);
            div.call(drawMethodPicker, store);

            const newOption = div.select('option[value="90649"]');
            newOption.attr('selected', true);

            div.select('select').dispatch('change');

            expect(store.getState().hydrographState.selectedIVMethodID).toBe('90649');
            expect(showDataIndicatorSpy.mock.calls).toHaveLength(1);
            expect(showDataIndicatorSpy.mock.calls[0][0]).toBe(false);
        });

        it('Expects if the data has only one method then the picker will be hidden', () => {
            let store = configureStore({
                ...TEST_STATE,
                hydrographData: {
                    primaryIVData: {
                        ...TEST_STATE,
                        values: {
                            '90649': {
                                ...TEST_PRIMARY_IV_DATA.values['90649']
                            }
                        }
                    }
                }
            });
            div.call(drawMethodPicker, store);

            expect(div.select('#ts-method-select-container').attr('hidden')).toBe('true');
        });
    });
});
