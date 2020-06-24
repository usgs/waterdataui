/*
 * Synchronous Redux action to set the window width and page width (the drawing width)
 * @param {Number} windowWidth
 * @param {Number} width
 * @return {Object} Redux action
 */
const resizeUI = function(windowWidth, width) {
    return {
        type: 'RESIZE_UI',
        windowWidth,
        width
    };
};

export const uiReducer = function(ui={}, action) {
    switch(action.type) {
        case 'RESIZE_UI':
            return {
                ...ui,
                windowWidth: action.windowWidth,
                width: action.width
            };

        default: return ui;
    }
};

export const Actions ={
    resizeUI
};
