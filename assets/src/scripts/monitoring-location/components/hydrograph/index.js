/**
 * Hydrograph charting module.
 */
import {select} from 'd3-selection';
import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import config from 'ui/config.js';
import {link} from 'ui/lib/d3-redux';

import {sortedParameters} from 'ui/utils';

import {drawWarningAlert, drawInfoAlert} from 'd3render/alerts';
import {drawLoadingIndicator} from 'd3render/loading-indicator';

//import {isPeriodWithinAcceptableRange, isPeriodCustom} from 'ml/iv-data-utils';
//import {renderTimeSeriesUrlParams} from 'ml/url-params';

//import {hasAnyVariables, getCurrentVariableID, getCurrentParmCd, getVariables} from 'ml/selectors/time-series-selector';

import {retrieveHydrographData} from 'ml/store/hydrograph-data';
//import {Actions as ivTimeSeriesDataActions} from 'ml/store/instantaneous-value-time-series-data';
//import {Actions as ivTimeSeriesStateActions} from 'ml/store/instantaneous-value-time-series-state';
//import {Actions as statisticsDataActions} from 'ml/store/statistics-data';
//import {Actions as timeZoneActions} from 'ml/store/time-zone';
//import {Actions as floodDataActions} from 'ml/store/flood-inundation';

//import {drawDateRangeControls} from './date-controls';
//import {drawDataTables} from './data-table';
//import {renderDownloadLinks} from './download-links';
import {drawGraphBrush} from './graph-brush';
//import {drawGraphControls} from './graph-controls';
import {drawTimeSeriesLegend} from './legend';
import {drawMethodPicker} from './method-picker';
//import {plotSeriesSelectTable} from './parameters';
import {drawTimeSeriesGraph} from './time-series-graph';
import {drawTooltipCursorSlider} from './tooltip';

//import {getLineSegmentsByParmCd} from './selectors/drawing-data';
//import {SPARK_LINE_DIM}  from './selectors/layout';
//import {getAvailableParameterCodes} from './selectors/parameter-data';
//import {getTimeSeriesScalesByParmCd} from './selectors/scales';

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
                                         latitude,
                                         longitude,
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

    // Fetch waterwatch flood levels
    //store.dispatch(floodDataActions.retrieveWaterwatchData(siteno));
     // Need to set default parameter code in server and insert in markup */
    const fetchDataPromise = store.dispatch(retrieveHydrographData(siteno, {
        parameterCode: parameterCode,
        period: startDT && endDT ? null : period || 'P7D',
        startTime: DateTime.fromISO(startDT, {zone: config.locationTimeZone}),
        endTime: DateTime.fromISO(endDT, {zone: config.locationTimeZone}),
        loadCompare: false,
        loadMedian: false
    }));
    fetchDataPromise.then(() => {
        console.log('Finished fetching Hydrograph data');
        nodeElem
            .select('.loading-indicator-container')
            .call(drawLoadingIndicator, {showLoadingIndicator: false, sizeClass: 'fa-3x'});

            // Initial data has been fetched. We can render the hydrograph elements
            // Initialize method picker before rendering time series
            let graphContainer = nodeElem.select('.graph-container')
                .call(drawMethodPicker, store, timeSeriesId)
                .call(drawTimeSeriesGraph, store, siteno, agencyCode, sitename, showMLName, !showOnlyGraph);

            if (!showOnlyGraph) {
                graphContainer
                    .call(drawTooltipCursorSlider, store)
                    .call(drawGraphBrush, store);
            }
            graphContainer.append('div')
                .classed('ts-legend-controls-container', true)
                .call(drawTimeSeriesLegend, store);
            // Add UI interactive elements, data table  and the provisional data alert.
            /*
            if (!showOnlyGraph) {
                nodeElem
                    .call(drawMethodPicker, store)
                    .call(drawDateRangeControls, store, siteno);

                nodeElem.select('.ts-legend-controls-container')
                    .call(drawGraphControls, store);

                nodeElem.select('#iv-graph-list-container')
                    .call(renderDownloadLinks, store, siteno);

                nodeElem.select('#iv-data-table-container')
                    .call(drawDataTables, store);
                //TODO: Find out why putting this before drawDataTable causes the tests to not work correctly
                nodeElem.select('.select-time-series-container')
                    .call(link(store, plotSeriesSelectTable, createStructuredSelector({
                        siteno: () => siteno,
                        availableParameterCodes: getAvailableParameterCodes,
                        lineSegmentsByParmCd: getLineSegmentsByParmCd('current', 'P7D'),
                        timeSeriesScalesByParmCd: getTimeSeriesScalesByParmCd('current', 'P7D', SPARK_LINE_DIM)
                    }), store));

                renderTimeSeriesUrlParams(store);
            }
            */

    });

};
