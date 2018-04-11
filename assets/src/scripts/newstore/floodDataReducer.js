const INITIAL_STATE = {
    floodStages: [],
    floodExtent: {},
    gageHeight: null
};

/*
 * Utility function which returns the closest gage height in floodStages to gageHeight
 * @param {Number} gageHeight
 * @param {Array of Number} floodStages
 * @return {Number} - should be an element in floodStages unless floodStages is empty and then returns gageHeight
 */
const getGageHeightInStage = function(gageHeight, floodStages) {
    let result = gageHeight;
    if (floodStages.length) {
        // Set gageHeight to the nearest flood stage
        result = floodStages[0];
        let diff = Math.abs(gageHeight - result );
        floodStages.forEach((stage) => {
            let newDiff = Math.abs(gageHeight - stage);
            if (newDiff < diff) {
                diff = newDiff;
                result = stage;
            }
        });
    }
    return result;
};

/*
 * Case reducers
 */
const setFloodFeatures = function(floodState, action) {
    return {
        ...floodState,
        floodStages: action.stages,
        floodExtent: action.extent,
        gageHeight: getGageHeightInStage(floodState.gageHeight, action.stages)
    };
};

const setGageHeightFromStage = function(floodState, action) {
    if (action.gageHeightIndex < floodState.floodStages.length) {
        return {
            ...floodState,
            gageHeight: floodState.floodStages[action.gageHeightIndex]
        };
    } else {
        return floodState;
    }
};

const setGageHeight = function(floodState, action) {
    return getGageHeightInStage(action.gageHeight, floodState.floodStages);
};

/*
 * Slice reducer
 */
export const floodDataReducer = function(floodState=INITIAL_STATE, action) {
    switch(action.type) {
        case 'SET_FLOOD_FEATURES': return setFloodFeatures(floodState, action);
        case 'SET_GAGE_HEIGHT_FROM_STAGE': return setGageHeightFromStage(floodState, action);
        case 'SET_GAGE_HEIGHT': return setGageHeight(floodState, action);
        default: return floodState;
    }
};
