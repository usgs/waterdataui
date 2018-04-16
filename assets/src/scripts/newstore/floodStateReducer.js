
const INITIAL_STATE = {
    gageHeight: null
};

const setGageHeight = function(floodState, action) {
    return {
        ...floodState,
        gageHeight: action.gageHeight
    };
};


export const floodStateReducer = function(floodState=INITIAL_STATE, action) {
    switch(action.type) {
        case 'SET_GAGE_HEIGHT': return setGageHeight(floodState, action);
        default: return floodState;
    }
};