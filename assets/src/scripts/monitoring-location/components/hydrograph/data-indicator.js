import {select} from 'd3-selection';

import config from 'ui/config';
import {link} from 'ui/lib/d3-redux';
import {mediaQuery} from 'ui/utils';

import {drawLoadingIndicator} from 'd3render/loading-indicator';

import {hasAnyVisibleData} from './selectors/time-series-data';
import {getMainLayout} from './selectors/layout';

const updateNoDataOverlay = function(container, store) {
    const noDataOverlay = container.select('div');
    const hasVisibleData = hasAnyVisibleData(store.getState());
    if (hasVisibleData && noDataOverlay.size()) {
        noDataOverlay.remove();
    } else if (!hasVisibleData && !noDataOverlay.size()) {
        const overlayDiv = container.append('div')
            .call(link(store, (elem, layout) => {
                elem.style('transform', `translateY(${layout.height / 2}px)`);
            }, getMainLayout));
        overlayDiv.append('div').text('No data available');
    }
};

/*
 * Makes the loading indicator visible if isLoading otherwise removes the loading indicator and
 * adds/removes the "no data" overlay as appropriate.
 * @param {Boolean} isLoading
 * @param {Redux store} store - If missing, the loading container position is not centered and
 * the "no data" overlay is not updated. In practice, the store is not passed in until the data
 * has been loaded once (at hydrograph component initialization). Until then the graph has not been
 * rendered, therefore the loading indicator does not need to be moved.
 */
export const showDataIndicators = function(isLoading, store) {
    const loadingContainer = select('#hydrograph-loading-indicator-container')
        .call(drawLoadingIndicator, {
            showLoadingIndicator: isLoading,
            sizeClass: mediaQuery(config.USWDS_MEDIUM_SCREEN) ? 'fa-4x' : 'fa-2x'
        });
    if (isLoading && store) {
        loadingContainer.style('transform', `translateY(${getMainLayout(store.getState()).height / 2}px)`);
    } else  if (!isLoading && store) {
        select('#hydrograph-no-data-overlay').call(updateNoDataOverlay, store);
    }
};