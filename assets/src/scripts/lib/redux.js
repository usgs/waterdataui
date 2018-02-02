// This code is derived from d3-redux: https://github.com/couchand/d3-redux
// Copyright (c) 2017 Andrew Couch, MIT licensed.

const { local } = require('d3-selection');

const storeLocal = local();


export function subscribe(store, callback, args) {
    var currentState = store.getState();
    function handleUpdate() {
        var nextState = store.getState();
        if (nextState != currentState) {
            currentState = nextState;
            callback.apply(null, args);
        }
    }

    store.subscribe(handleUpdate);
}


export function connect(callback) {
    return function(selection) {
        var args = [selection].concat([].slice.call(arguments, 1));

        var stores = [];
        selection.each(function() {
            var store = storeLocal.get(this);
            if (stores.indexOf(store) < 0) stores.push(store);
        });

        for (var i = 0; i < stores.length; i++) {
            subscribe(stores[i], callback, args);
        }

        callback.apply(null, args);
    };
}


export function dispatch(handler) {
    return function(d, i, g) {
        var action = handler.call(this, d, i, g);
        if (action) {
            var store = storeLocal.get(this);
            store.dispatch(action);
        }
    };
}


export function fromState(selector) {
    return function(d, i, g) {
        var store = storeLocal.get(this);
        return selector.call(this, store.getState(), d, i, g);
    };
}


export function provide(store) {
    return function(selection) {
        selection.property(storeLocal, store);
    };
}
