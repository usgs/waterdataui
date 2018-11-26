const INITIAL_STATE = {
    stages: [],
    extent: {}

};


/*
 * Case reducers
 * Assumes that stages are sorted in ascending order.
 */
const setFloodFeatures = function(floodData, action) {
    return {
        stages: action.stages,
        extent: action.extent
    };
};

/*
 * Slice reducer
 */
export const floodDataReducer = function(floodData=INITIAL_STATE, action) {
    switch(action.type) {
        case 'SET_FLOOD_FEATURES': return setFloodFeatures(floodData, action);
        default: return floodData;
    }
};
