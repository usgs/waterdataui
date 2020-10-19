import {createStore} from 'redux';

import {listen} from 'ui/lib/d3-redux';


describe('d3-redux', () => {
    let store;

    beforeEach(() => {
        store = createStore((state, action) => action.payload);
    });

    describe('listen', () => {
        const selector = function(state) {
            return state;
        };

        it('calls listener immediately and when selector state changes', () => {
            const state1 = 'state1';
            const state2 = 'state2';
            const spy = jasmine.createSpy('listener');
            listen(store, selector, spy, false);
            expect(spy.calls.count()).toEqual(1);
            store.dispatch({type: 'a', payload: state1});
            expect(spy.calls.count()).toEqual(2);
            store.dispatch({type: 'a', payload: state1});
            expect(spy.calls.count()).toEqual(2);
            store.dispatch({type: 'a', payload: state2});
            expect(spy.calls.count()).toEqual(3);
        });

        it('returns correct object', (done) => {
            const state = 'my state object';
            store.dispatch({type: 'a', payload: state});
            listen(store, selector, function (value) {
                expect(value).toBe(state);
                done();
            });
        });

        it('calls listener at next animation frame when raf parameter specified', (done) => {
            const state1 = 'state1';
            const spy = jasmine.createSpy('listener');
            listen(store, selector, spy, true);
            expect(spy.calls.count()).toEqual(1);
            store.dispatch({type: 'a', payload: state1});
            window.requestAnimationFrame(() => {
                expect(spy.calls.count()).toEqual(2);
                done();
            });
        });
    });
});