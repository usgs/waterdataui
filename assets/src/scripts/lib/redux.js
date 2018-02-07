// This code is derived from d3-redux: https://github.com/couchand/d3-redux
// Copyright (c) 2017 Andrew Couch, MIT licensed.

const { local } = require('d3-selection');

const storeLocal = local();


export function subscribe(store, callback, args) {
    let currentState = store.getState();

    function handleUpdate() {
        let nextState = store.getState();
        if (nextState != currentState) {
            currentState = nextState;
            let myArgs = args.concat([nextState]);
            callback.apply(null, myArgs);
        }
    }

    store.subscribe(handleUpdate);
}


export function connect(callback) {
    return function(selection) {
        let args = [selection].concat([].slice.call(arguments, 1));

        let stores = [];
        selection.each(function () {
            let store = storeLocal.get(this);
            if (stores.indexOf(store) < 0) stores.push(store);
        });

        for (let i = 0; i < stores.length; i++) {
            subscribe(stores[i], callback, args);
            callback.apply(null, args.concat([stores[i].getState()]));
        }
    };
}


export function dispatch(handler) {
    return function (d, i, g) {
        let action = handler.call(this, d, i, g);
        if (action) {
            let store = storeLocal.get(this);
            store.dispatch(action);
        }
    };
}


export function fromState(selector) {
    return function () {
        let store = storeLocal.get(this);
        return selector.call(this, store.getState(), ...arguments);
    };
}


export function provide(store) {
    return function (selection) {
        selection.property(storeLocal, store);
    };
}


/**
 * Calls the provided D3 callback with provided state when updated.
 * @param  {Function} func   D3 callback accepting (elem, options)
 * @param  {Object} selector Source selector for options
 * @return {Function}        D3 callback
 */

export function link(func, selector) {
    let currentOptions = null;
    let retval = null;
    return connect(function (selection, state) {
        let nextOptions = selector(state);
        if (currentOptions !== nextOptions) {
            currentOptions = nextOptions;
            retval = func.call(null, selection, currentOptions);
        }
        return retval;
    });
}
