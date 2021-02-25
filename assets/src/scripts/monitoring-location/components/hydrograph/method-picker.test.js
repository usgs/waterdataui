import {select} from 'd3-selection';

import {configureStore} from 'ml/store';

import {drawMethodPicker} from './method-picker';
import {TEST_PRIMARY_IV_DATA} from './mock-hydrograph-state';

describe('monitoring-location/components/hydrograph/method-picker', () => {

    describe('drawMethodPicker', () => {
        const TEST_STATE = {
            hydrographData: {
                primaryIVData: TEST_PRIMARY_IV_DATA
            },
            hydrographState: {
                selectedIVMethodID: '90649'
            }
        };
        let div;
        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        it('Creates a picker and sets the currentMethodID', () => {
            let store = configureStore(TEST_STATE);
            div.call(drawMethodPicker, store);

            expect(div.select('#ts-method-select-container').attr('hidden')).toBeNull();
            expect(div.select('select').property('value')).toEqual('90649');
        });

        it('selecting a different method updates the store', () => {
            let store = configureStore(TEST_STATE);
            div.call(drawMethodPicker, store);

            const newOption = div.select('option[value="252055"]');
            newOption.attr('selected', true);

            div.select('select').dispatch('change');

            expect(store.getState().hydrographState.selectedIVMethodID).toBe('252055');
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
