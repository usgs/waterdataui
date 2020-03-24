import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import {default as thunk} from 'redux-thunk';

const createReducer = function(asyncReducers) {
  return combineReducers({
    ...asyncReducers
  });
}

const MIDDLEWARES = [thunk];

export const configureReduxStore = function(initialState, reducers) {

  let enhancers;
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
      enhancers = compose(
          applyMiddleware(...MIDDLEWARES),
          window.__REDUX_DEVTOOLS_EXTENSION__({serialize: true})
      );
  } else {
      enhancers = applyMiddleware(...MIDDLEWARES);
  }

  const store = createStore(createReducer(reducers), initialState, enhancers);

  // Add a dictionary to keep track of the registered async reducers
  store.asyncReducers = {};

  // Create an inject reducer function
  // This function adds the async reducer, and creates a new combined reducer
  store.injectReducer = (key, asyncReducer) => {
    store.asyncReducers[key] = asyncReducer;
    store.replaceReducer(createReducer(store.asyncReducers));
  };

  // Return the modified store
  return store;
}

