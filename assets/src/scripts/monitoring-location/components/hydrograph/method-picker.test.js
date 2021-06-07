import {select} from 'd3-selection';

import * as utils from 'ui/utils';

import {configureStore} from 'ml/store';

import {getSortedIVMethods} from './selectors/time-series-data';

import {drawMethodPicker} from './method-picker';
import {TEST_PRIMARY_IV_DATA} from './mock-hydrograph-state';

describe('monitoring-location/components/hydrograph/method-picker', () => {
    utils.mediaQuery = jest.fn().mockReturnValue(true);

    describe('drawMethodPicker', () => {
        const TEST_STATE = {
            hydrographData: {
                primaryIVData: TEST_PRIMARY_IV_DATA
            }
        };
        let div;
        beforeEach(() => {
            div = select('body').append('div');
            div.append('div').attr('id', 'expansion-container-row-72019');
        });

        afterEach(() => {
            div.remove();
        });

        it('Creates a picker and sets the currentMethodID to preferred method id', () => {
            let store = configureStore(TEST_STATE);
            div.call(drawMethodPicker, getSortedIVMethods(store.getState()), store);

            expect(div.select('select').property('value')).toEqual('90649');
        });

        it('Expects if the data has only one method then the picker will be not be drawn', () => {
            let store = configureStore({
                ...TEST_STATE,
                hydrographData: {
                    primaryIVData: {
                        ...TEST_STATE.hydrographData.primaryIVData,
                        values: {
                            '90649': {
                                ...TEST_PRIMARY_IV_DATA.values['90649']
                            }
                        }
                    }
                }
            });
            div.call(drawMethodPicker, getSortedIVMethods(store.getState()), store);

            expect(div.select('#primary-sampling-method-row').size()).toBe(0);
        });

        it('Expects the methods will be in order from most to least points', () => {
            let store = configureStore({
                ...TEST_STATE
            });
            div.call(drawMethodPicker, getSortedIVMethods(store.getState()), store);
            const allOptionElements = div.selectAll('option');
            expect(allOptionElements['_groups'][0][0].getAttribute('value')).toBe('90649');
            expect(allOptionElements['_groups'][0][1].getAttribute('value')).toBe('252055');
        });

        it('Expects that there will be a message if some of the methods have no points', () => {
            let store = configureStore({
                ...TEST_STATE
            });
            div.call(drawMethodPicker, getSortedIVMethods(store.getState()), store);

            expect(div.select('#no-data-points-note')['_groups'][0][0].innerHTML).toContain('some methods are disabled');
        });

        it('Expects that there will NOT be a message all of the methods have points', () => {
            let store = configureStore({
                ...TEST_STATE,
                hydrographData: {
                    primaryIVData: {
                        ...TEST_STATE.hydrographData.primaryIVData,
                        values: {
                            '90649': {
                                ...TEST_PRIMARY_IV_DATA.values['90649']
                            },
                            '252055': {
                                points: [
                                    {value: 25.6, qualifiers: ['E'], dateTime: 1600618500000},
                                    {value: 26.5, qualifiers: ['P'], dateTime: 1600619400000},
                                    {value: 25.9, qualifiers: ['P'], dateTime: 1600620300000}
                                ],
                                method: {
                                    methodDescription: 'From multiparameter sonde',
                                    methodID: '252055'
                                }
                            }
                        }
                    }
                }
            });
            div.call(drawMethodPicker, getSortedIVMethods(store.getState()), store);

            expect(div.select('#no-data-points-note').size()).toBe(0);
        });
    });
});
