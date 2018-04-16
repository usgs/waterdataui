
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

export const uiReducer = function(ui={}, action) {
    switch(action.type) {
        case 'RESIZE_UI': return resizeUI(ui, action);
        default: return ui;
    }
};