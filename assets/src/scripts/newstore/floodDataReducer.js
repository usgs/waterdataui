const INITIAL_STATE = {
    floodData: {
        stages: [],
        extent: {}
    }
};


/*
 * Case reducers
 * Assumes that stages are sorted in ascending order.
 */
const setFloodFeatures = function(state, action) {
    return {
        ...state,
        floodData: {
            stages: action.stages,
            extent: action.extent
        }
    };
};

/*
 * Slice reducer
 */
export const floodDataReducer = function(state=INITIAL_STATE, action) {
    switch(action.type) {
        case 'SET_FLOOD_FEATURES': return setFloodFeatures(state, action);
        default: return state;
    }
};
