import {select} from 'd3-selection';

import config from 'ui/config';
import {mediaQuery} from 'ui/utils';
import {drawLoadingIndicator} from 'd3render/loading-indicator';

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