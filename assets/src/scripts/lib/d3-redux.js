// This code is derived from d3-redux: https://github.com/couchand/d3-redux
// Copyright (c) 2017 Andrew Couch, MIT licensed.

import throttle from 'raf-throttle';

/*
 * Subscribes to changes in store and calls callback when the store's state changes.
 * @param {Object} store - Redux Store object
 * @param {Function} callback - function that will be called when the state store changes.
 * @param {Array of String} args - args used when executing callback. Note that the state of store will be appended to the list of args
 */
export const subscribe = function(store, callback, args) {
    let currentState = store.getState();

    function handleUpdate() {
        let nextState = store.getState();
        if (nextState != currentState) {
            currentState = nextState;
            let myArgs = args.concat([nextState]);
            callback.apply(null, myArgs);
        }
    }

    store.subscribe(throttle(handleUpdate));
};

/**
 * Calls the callback function, passing in the current selection. A call is made
 * immediately, and the selection subscribes to the store, calling the function
 * again any time the state changes. This is analogous to a vanilla use of
 * selection.call, but adding a subscription to the provided store.
 * @param  {Object}  store  - Redux store
 * @param  {Function} callback - Callback function
 * @return {Function}
 */
export const connect = function(store, callback) {
    return function(selection) {
        let args = [selection].concat([].slice.call(arguments, 1));
        subscribe(store, callback, args);
        callback.apply(null, args.concat([store.getState()]));
    };
};

/**
 * Calls the provided D3 callback with provided state when updated.
 * @param  {Object} store       Redux Store
 * @param  {Function} func      D3 callback accepting (elem, options)
 * @param  {Object} selector    Source selector for options
 * @param  {Object} ...args     Optional additional arguments to proxy to `func`
 * @return {Function}           D3 callback
 */
export const link = function(store, func, selector, ...args) {
    let currentOptions = null;
    let context = null;
    return connect(store, function(selection, state) {
        let nextOptions = selector(state);
        if (currentOptions !== nextOptions) {
            currentOptions = nextOptions;
            context = func.call(null, selection, currentOptions, ...args, context);
        }
        return context;
    });
};

/**
 * Subscribe to state changes of a specific selector.
 * @param  {Object} store       Redux store
 * @param  {Function} selector  Redux selector
 * @param  {Function} func      Callback function
 * @param  {Function} raf       If true, throttle callback with requestAnimationFrame
 * @return {Function}           Unsubscribe function
 */
export const listen = function(store, selector, func, raf = true) {
    let current = selector(store.getState());
    let callback = function() {
        let newData = selector(store.getState());
        if (current !== newData) {
            current = newData;
            func(current);
        }
    };
    if (raf) {
        callback = throttle(callback);
    }
    func(current);
    return store.subscribe(callback);
};

/**
 * Calls the provided D3 callbacks, calling an initialization function and
 * then an update function on state changes.
 * @param  {Function} initFunc (elem, options) => D3 selection
 * @param  {Function} updateFunc (elem, options)
 */
export const initAndUpdate = function(initFunc, updateFunc) {
    let node = null;
    return function(elem, options) {
        if (node === null) {
            node = initFunc(elem, options);
        }
        updateFunc(node, options);
    };
};
