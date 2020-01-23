
/*
 * Case reducers
 */
const resizeUI = function(ui, action) {
    return {
        ...ui,
        windowWidth: action.windowWidth,
        width: action.width
    };
};

const setHydrographXRange = function(ui, action) {
    return {
        ...ui,
        hydrographXRange: {
            start: action.hydrographXRange[0],
            end: action.hydrographXRange[1]
        }
    };
};

const clearHydrographXrange = function(ui, action) {
    return {
        ...ui,
        hydrographXRange: undefined
    };
};

export const uiReducer = function(ui={}, action) {
    switch(action.type) {
        case 'RESIZE_UI': return resizeUI(ui, action);
        case 'SET_HYDROGRAPH_X_RANGE': return setHydrographXRange(ui, action);
        case 'CLEAR_HYDROGRAPH_X_RANGE': return clearHydrographXrange(ui, action);
        default: return ui;
    }
};
