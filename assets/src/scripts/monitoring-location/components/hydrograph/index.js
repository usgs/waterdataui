/**
 * Hydrograph charting module.
 */
import {select} from 'd3-selection';
import {DateTime} from 'luxon';

import config from 'ui/config.js';

import {drawInfoAlert} from 'd3render/alerts';
import {drawLoadingIndicator} from 'd3render/loading-indicator';

import {renderTimeSeriesUrlParams} from 'ml/url-params';


import {retrieveHydrographData} from 'ml/store/hydrograph-data';
import {retrieveHydrographParameters} from 'ml/store/hydrograph-parameters';
import {setSelectedParameterCode, setCompareDataVisibility} from 'ml/store/hydrograph-state';

import {Actions as floodDataActions} from 'ml/store/flood-inundation';

//import {drawDateRangeControls} from './date-controls';
import {drawDataTables} from './data-table';
//import {renderDownloadLinks} from './download-links';
import {drawGraphBrush} from './graph-brush';
import {drawGraphControls} from './graph-controls';
import {drawTimeSeriesLegend} from './legend';
import {drawMethodPicker} from './method-picker';
import {drawSelectionTable} from './parameters';
import {drawTimeSeriesGraph} from './time-series-graph';
import {drawTooltipCursorSlider} from './tooltip';


/*
 * Renders the hydrograph on the node element using the Redux store for state information. The siteno, latitude, and
 * longitude are required parameters. All others are optional and are used to set the initial state of the hydrograph.
 * @param {Redux store} store
 * @param {DOM node} node
 * @param {Object} - string properties to set initial state information. The property siteno is required
 * @param {Promise} loadPromise - will resolve when any data needed by this module
 *                                that is fetched by the caller has been fetched
 * */
export const attachToNode = function(store,
                                     node,
                                     {
                                         siteno,
                                         agencyCode,
                                         sitename,
                                         parameterCode,
                                         compare,
                                         period,
                                         startDT,
                                         endDT,
                                         timeSeriesId,
                                         showOnlyGraph = false,
                                         showMLName = false
                                     } = {}) {
    const nodeElem = select(node);
    if (!config.ivPeriodOfRecord && !config.gwPeriodOfRecord) {
        select(node).select('.graph-container').call(drawInfoAlert, {title: 'Hydrograph Alert', body: 'No IV or field visit data is available.'});
        return;
    }

    // Show the loading indicator
    nodeElem
        .select('.loading-indicator-container')
        .call(drawLoadingIndicator, {showLoadingIndicator: true, sizeClass: 'fa-3x'});

    const fetchDataPromise = store.dispatch(retrieveHydrographData(siteno, {
        parameterCode: parameterCode,
        period: startDT && endDT ? null : period || 'P7D',
        startTime: DateTime.fromISO(startDT, {zone: config.locationTimeZone}),
        endTime: DateTime.fromISO(endDT, {zone: config.locationTimeZone}),
        loadCompare: compare,
        loadMedian: false
    }));
    store.dispatch(setCompareDataVisibility(compare));

    // if showing the controls, fetch the parameters
    let fetchParameters;
    if (!showOnlyGraph) {
        fetchParameters = store.dispatch(retrieveHydrographParameters(siteno));
    }

    // Fetch waterwatch flood levels - TODO: consider only fetching when gage height is requested
    store.dispatch(floodDataActions.retrieveWaterwatchData(siteno));

    fetchDataPromise.then(() => {
        console.log('Finished fetching Hydrograph data');
        nodeElem
            .select('.loading-indicator-container')
            .call(drawLoadingIndicator, {showLoadingIndicator: false, sizeClass: 'fa-3x'});

        // Initial data has been fetched. We can render the hydrograph elements
        // Initialize method picker before rendering the graph in order to set the selected method id
        if (!showOnlyGraph) {
            nodeElem.call(drawMethodPicker, store, timeSeriesId);
        }
        let graphContainer = nodeElem.select('.graph-container');
        graphContainer.call(drawTimeSeriesGraph, store, siteno, agencyCode, sitename, showMLName, !showOnlyGraph);

        if (!showOnlyGraph) {
            graphContainer
                .call(drawTooltipCursorSlider, store)
                .call(drawGraphBrush, store);
        }
        const legendControlsContainer = graphContainer.append('div')
            .classed('ts-legend-controls-container', true)
            .call(drawTimeSeriesLegend, store);

        if (!showOnlyGraph) {
            /*
            nodeElem
                .call(drawDateRangeControls, store, siteno);
            */
            legendControlsContainer.call(drawGraphControls, store, siteno);
/*
            nodeElem.select('#iv-graph-list-container')
                .call(renderDownloadLinks, store, siteno);
*/
            nodeElem.select('#iv-data-table-container')
                .call(drawDataTables, store);

            // Set the parameter code explictly. We may eventually set this within the parameter selection table
            store.dispatch(setSelectedParameterCode(parameterCode));

            fetchParameters.then(() => {
                nodeElem.select('.select-time-series-container')
                    .call(drawSelectionTable, store, siteno);
            });
            renderTimeSeriesUrlParams(store);
        }
    });

};
