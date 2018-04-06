/**
 * Toggles tooltips on/off in response to touchstart events.
 */
export const registerTooltips = function () {
    let selectedTooltip;
    function handler(event) {
        if (selectedTooltip) {
            selectedTooltip.classList.remove('show-tooltip');
            selectedTooltip = null;
        } else {
            selectedTooltip = event.target.closest('.tooltip-item');
            if (selectedTooltip) {
                selectedTooltip.classList.add('show-tooltip');
            }
        }
    }
    document.addEventListener('touchstart', handler);
    return handler;
};

/**
 * Toggles tooltips on/off in response to touchstart events.
 */
export const unregisterTooltips = function (handler) {
    document.removeEventListener('touchstart', handler);
};


export const register = function () {
    registerTooltips();
};
