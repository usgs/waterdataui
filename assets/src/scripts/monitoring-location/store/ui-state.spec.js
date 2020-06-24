import { applyMiddleware, combineReducers, createStore } from 'redux';
import {default as thunk} from 'redux-thunk';

import {uiReducer, Actions} from './ui-state';

describe('monitoring-location/store/ui-state module', () => {
    let store;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                ui: uiReducer
            }),
            {
                ui: {
                    windowWidth: 1024,
                    width: 800
                }
            },
            applyMiddleware(thunk)
        );
    });

    describe('uiReducer', () => {
        describe('Actions.resizeUI', () => {
            it('Updates the windowWidth and with', () => {
                store.dispatch(Actions.resizeUI(700, 400));

                const ui = store.getState().ui;
                expect(ui.windowWidth).toBe(700);
                expect(ui.width).toBe(400);
            });
        });
    });
});
