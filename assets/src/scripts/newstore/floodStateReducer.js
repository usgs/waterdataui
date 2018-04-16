
/*
 * Case reducers
 */
const setGageHeight = function(floodState, action) {
    return {
        ...floodState,
        gageHeight: action.gageHeight
    };
};

/*
 * Slice reducer
 */
export const floodStateReducer = function(floodState={}, action) {
    switch(action.type) {
        case 'SET_GAGE_HEIGHT': return setGageHeight(floodState, action);
        default: return floodState;
    }
};