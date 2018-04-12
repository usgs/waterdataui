const INITIAL_STATE = {
    floodData: {
        stages: [],
        extent: {}
    },
    floodGageHeight: null
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
const setFloodFeatures = function(state, action) {
    return {
        ...state,
        floodData: {
            stages: action.stages,
            extent: action.extent
        },
        floodGageHeight: getGageHeightInStage(state.floodGageHeight, action.stages)
    };
};

const setGageHeightFromStage = function(state, action) {
    if (action.gageHeightIndex < state.floodData.stages.length) {
        return {
            ...state,
            floodGageHeight: state.floodData.stages[action.gageHeightIndex]
        };
    } else {
        return state;
    }
};

const setGageHeight = function(state, action) {
    return {
        ...state,
        floodGageHeight: getGageHeightInStage(action.gageHeight, state.floodData.stages)
    };
};

/*
 * Slice reducer
 */
export const floodDataReducer = function(state=INITIAL_STATE, action) {
    switch(action.type) {
        case 'SET_FLOOD_FEATURES': return setFloodFeatures(state, action);
        case 'SET_GAGE_HEIGHT_FROM_STAGE': return setGageHeightFromStage(state, action);
        case 'SET_GAGE_HEIGHT': return setGageHeight(state, action);
        default: return state;
    }
};
