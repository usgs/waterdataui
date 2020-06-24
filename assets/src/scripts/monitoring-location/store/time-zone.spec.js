import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';

import {Actions, timeZoneReducer} from './time-zone';

describe('monitoring-location/store/time-zone module', () => {
    let store;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                ianaTimeZone: timeZoneReducer
            }),
            {
                ianaTimeZone: ''
            },
            applyMiddleware(thunk)
        );
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('timeZoneReduer', () => {
        describe('Actions.setIanaTimeZone', () => {
            it('sets the time zone', () => {
                store.dispatch(Actions.setIanaTimeZone('America/Chicago'));

                expect(store.getState().ianaTimeZone).toBe('America/Chicago');
            });
        });

        describe('Actions.retrieveIanaTimeZone', () => {
            it('Sets the latitude and longitude in the query', () => {
                store.dispatch(Actions.retrieveIanaTimeZone('45.3', '-100.2'));
                expect(jasmine.Ajax.requests.mostRecent().url).toContain('45.3,-100.2');
            });

            it('Successful fetch assigns time zone', (done) => {
                const promise = store.dispatch(Actions.retrieveIanaTimeZone('45.3', '-100.2'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 200,
                    responseText: '{"properties" : {"timeZone" : "America/Chicago"}}'
                });
                promise.then(() => {
                    expect(store.getState().ianaTimeZone).toBe('America/Chicago');
                    done();
                });
            });

            it('Failed fetch assigns time zone to be null', (done) => {
                const promise = store.dispatch(Actions.retrieveIanaTimeZone('45.3', '-100.2'));
                jasmine.Ajax.requests.mostRecent().respondWith({
                    status: 500,
                    responseText: '{"properties" : {}}'
                });
                promise.then(() => {
                    expect(store.getState().ianaTimeZone).toBeNull();
                    done();
                });
            });
        });
    });
});