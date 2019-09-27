import { select } from 'd3-selection';

import { provide } from '../../lib/redux';
import { configureStore } from '../../store';

import { drawMethodPicker } from './method-picker';

describe('method-picker', () => {

    describe('drawMethodPicker', () => {
        const DATA = [12, 13, 14, 15, 16].map(hour => {
            return {
                dateTime: new Date(`2018-01-03T${hour}:00:00.000Z`).getTime(),
                qualifiers: ['P'],
                value: hour
            };
        });

        const TEST_STATE = {
            series: {
                timeSeries: {
                    '00010:current': {
                        points: DATA,
                        tsKey: 'current:P7D',
                        variable: '00010id',
                        method: 69930
                    },
                    '00010:compare': {
                        points: DATA,
                        tsKey: 'compare:P7D',
                        variable: '00010id',
                        method: 69931
                    }
                },
                variables: {
                    '00010id': {
                        oid: '00010id',
                        variableCode: {
                            value: '00010'
                        },
                        unit: {
                            unitCode: 'deg C'
                        }
                    }
                },
                methods: {
                    69930: {
                        methodDescription: 'Description 1',
                        methodID: 69930
                    },
                    69931: {
                        methodDescription: 'Description 2',
                        methodID: 69931
                    }
                }
            },
            timeSeriesState: {
                currentVariableID: '00010id'
            }
        };

        let div;
        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        let store = configureStore(TEST_STATE);

        it('Creates a picker and sets the currentMethodID', () => {
            div.call(provide(store))
                .call(drawMethodPicker);

            expect(div.select('select').property('value')).toEqual('69930');
            expect(store.getState().timeSeriesState.currentMethodID).toEqual(69930);
        });
    });
});
