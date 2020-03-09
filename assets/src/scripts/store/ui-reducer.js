
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

const setHydrographBrushOffset= function(ui, action) {
    return {
        ...ui,
        hydrographXRange: {
            start: action.hydrographXRange[0],
            end: action.hydrographXRange[1]
        }
    };
};

const clearHydrographBrushOffset = function(ui) {
    return {
        ...ui,
        hydrographXRange: undefined
    };
};

export const uiReducer = function(ui={}, action) {
    switch(action.type) {
        case 'RESIZE_UI': return resizeUI(ui, action);
        case 'SET_HYDROGRAPH_BRUSH_OFFSET': return setHydrographBrushOffset(ui, action);
        case 'CLEAR_HYDROGRAPH_BRUSH_OFFSET': return clearHydrographBrushOffset(ui);
        default: return ui;
    }
};
