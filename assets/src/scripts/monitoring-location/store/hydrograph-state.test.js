import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';

import {INITIAL_STATE, setCompareDataVisibility, setMedianDataVisibility, setSelectedParameterCode,
    setSelectedIVMethodID, setSelectedDateRange, setSelectedCustomDateRange,
    setGraphCursorOffset, setGraphBrushOffset, clearGraphBrushOffset, hydrographStateReducer
} from './hydrograph-state';

describe('monitoring-location/store/hydrograph-state', () => {
    let store;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                hydrographState: hydrographStateReducer
            }),
            {
                hydrographState: INITIAL_STATE
            },
            applyMiddleware(thunk)
        );
    });

    describe('hydrographStateReducer', () => {
        describe('setCompareDataVisibility', () => {
            it('sets the compare data visibility', () => {
                store.dispatch(setCompareDataVisibility(true));
                expect(store.getState().hydrographState.showCompareIVData).toBe(true);

                store.dispatch(setCompareDataVisibility(false));
                expect(store.getState().hydrographState.showCompareIVData).toBe(false);
            });
        });

        describe('setMedianDataVisibility', () => {
            it('sets the median data visibility', () => {
                store.dispatch(setMedianDataVisibility(true));
                expect(store.getState().hydrographState.showMedianData).toBe(true);

                store.dispatch(setMedianDataVisibility(false));
                expect(store.getState().hydrographState.showMedianData).toBe(false);
            });
        });

        describe('setSelectedParameterCode', () => {
            it('Sets the selected parameter code', () => {
                store.dispatch(setSelectedParameterCode('00060'));
                expect(store.getState().hydrographState.selectedParameterCode).toBe('00060');
            });
        });

        describe('setSelectedIVMethodID', () => {
            it('sets the selected IV method id', () => {
                store.dispatch(setSelectedIVMethodID('1345'));
                expect(store.getState().hydrographState.selectedIVMethodID).toBe('1345');
            });
        });

        describe('setSelectedDateRange', () => {
            it('sets the selected date range kind', () => {
                store.dispatch(setSelectedDateRange('P30D'));
                expect(store.getState().hydrographState.selectedDateRange).toBe('P30D');
            });
        });

        describe('setSelectedCustomDateRange', () => {
            it('sets the selected custom date range', () => {
                store.dispatch(setSelectedCustomDateRange('2020-01-03', '2020-01-16'));
                const state = store.getState().hydrographState;

                expect(state.selectedCustomDateRange).toEqual({
                    start: '2020-01-03',
                    end: '2020-01-16'
                });
            });
        });

        describe('setGraphCursorOffset', () => {
            it('sets the graph cursor offset', () => {
                store.dispatch(setGraphCursorOffset(100200300));
                expect(store.getState().hydrographState.graphCursorOffset).toBe(100200300);
            });
        });

        describe('setGraphBrushOffset', () => {
            it('sets the graph brush offset', () => {
                store.dispatch(setGraphBrushOffset(100200, 300400));

                expect(store.getState().hydrographState.graphBrushOffset).toEqual({
                    start: 100200,
                    end: 300400
                });
            });
        });

        describe('clearGraphBrushOffset', () => {
            it('clears the iv graph brush offset', () => {
                store.dispatch(setGraphBrushOffset(100200, 300400));
                store.dispatch(clearGraphBrushOffset());

                expect(store.getState().hydrographState.graphBrushOffset).toBeNull();
            });
        });
    });
});
