import {scaleLinear} from 'd3-scale';
import {select} from 'd3-selection';
import sinon from 'sinon';

import {configureStore} from 'ml/store';
import * as hydrographData from 'ml/store/hydrograph-data';

import {TEST_HYDROGRAPH_PARAMETERS} from './mock-hydrograph-state';
import {drawSelectionTable} from './parameters';

describe('monitoring-location/components/hydrograph/parameters module', () => {
   const TEST_STATE = {
       hydrographParameters: TEST_HYDROGRAPH_PARAMETERS,
       hydrographState: {
           selectedDateRange: 'P7D',
           selectedParameterCode: '72019'
       }
   };

   let div;
   let fakeServer;
   let store;
   let retrieveHydrographDataSpy;

   beforeEach(() => {
       div = select('body').append('div');
       fakeServer = sinon.createFakeServer();
       retrieveHydrographDataSpy = jest.spyOn(hydrographData, 'retrieveHydrographData');
   });

   afterEach(() => {
       fakeServer.restore();
       div.remove();
   });

   it('If no parameters defined the element is not rendered', () => {
       store = configureStore({
           hydrographParameters: {}
       });
       drawSelectionTable(div, store, '11112222');
       expect(div.select('#select-time-series').size()).toBe(0);
   });

   it('Expects the selection table to be rendered with the appropriate rows and selection', () => {
       store = configureStore(TEST_STATE);
       drawSelectionTable(div, store, '11112222');

       const container = div.select('#select-time-series');
       expect(container.size()).toBe(1);
       expect(container.select('table').size()).toBe(1);
       expect(container.selectAll('tbody tr').size()).toBe(5);

       expect(container.select('tbody input:checked').attr('value')).toEqual('72019');
   });

   it('Expects changing the selection retrieves hydrograph data', () => {
       store = configureStore(TEST_STATE);
       drawSelectionTable(div, store, '11112222');

       const rowOne = div.select('tbody tr:first-child');
       rowOne.dispatch('click');

       expect(store.getState().hydrographState.selectedParameterCode).toEqual('00060');
       expect(retrieveHydrographDataSpy).toHaveBeenCalledWith('11112222', {
           parameterCode: '00060',
           period: 'P7D',
           startTime: null,
           endTime: null,
           loadCompare: false,
           loadMedian: false
       });
   });
});
