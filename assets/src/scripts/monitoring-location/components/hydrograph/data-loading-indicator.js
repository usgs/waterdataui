import {select} from 'd3-selection';

import {drawLoadingIndicator} from 'd3render/loading-indicator';

export const showDataLoadingIndicator = function(isVisible) {
    select('#hydrograph-loading-indicator-container')
        .call(drawLoadingIndicator, {
            showLoadingIndicator: isVisible,
            sizeClass: 'fa-3x'
        });
};