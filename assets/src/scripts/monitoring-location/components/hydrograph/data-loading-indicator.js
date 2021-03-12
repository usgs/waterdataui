import {select} from 'd3-selection';

import config from 'ui/config';
import {mediaQuery} from 'ui/utils';
import {drawLoadingIndicator} from 'd3render/loading-indicator';

/*
 * Makes the loading indicator visible if isVisible otherwise removes the loading indicator.
 * The layoutHeight is used to roughly center the spinner within the hydrograph.
 * @param {Boolean} isVisible
 * @param {Number} layoutHeight
 */
export const showDataLoadingIndicator = function(isVisible, layoutHeight) {
    const container = select('#hydrograph-loading-indicator-container')
        .call(drawLoadingIndicator, {
            showLoadingIndicator: isVisible,
            sizeClass: mediaQuery(config.USWDS_MEDIUM_SCREEN) ? 'fa-4x' : 'fa-2x'
        });
    if (isVisible && layoutHeight) {
        container.style('transform', `translateY(${layoutHeight / 2}px)`);
    }
};