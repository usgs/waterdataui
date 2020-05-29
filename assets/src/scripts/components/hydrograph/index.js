/**
 * Hydrograph charting module.
 */
import {select} from 'd3-selection';

import {createStructuredSelector} from 'reselect';

import {drawWarningAlert, drawInfoAlert} from '../../d3-rendering/alerts';
import {drawLoadingIndicator} from '../../d3-rendering/loading-indicator';
import {link} from '../../lib/d3-redux';
import {hasAnyTimeSeries, getCurrentParmCd, getVariables} from '../../selectors/time-series-selector';
import {Actions as ivTimeSeriesDataActions} from '../../store/instantaneous-value-time-series-data';
import {Actions as ivTimeSeriesStateActions} from '../../store/instantaneous-value-time-series-state';
import {Actions as statisticsDataActions} from '../../store/statistics-data';
import {Actions as timeZoneActions} from '../../store/time-zone';
import {Actions as floodDataActions} from '../../store/flood-inundation';
import {renderTimeSeriesUrlParams} from '../../url-params';

import {drawDateRangeControls} from './date-controls';
import {lineSegmentsByParmCdSelector} from './drawing-data';
import {drawGraphBrush} from './graph-brush';
import {drawGraphControls} from './graph-controls';
import {SPARK_LINE_DIM}  from './layout';
import {drawTimeSeriesLegend} from './legend';
import {drawMethodPicker} from './method-picker';
import {plotSeriesSelectTable, availableTimeSeriesSelector} from './parameters';
import {timeSeriesScalesByParmCdSelector} from './scales';
import {drawTimeSeriesGraph} from './time-series-graph';
import {drawTooltipCursorSlider} from './tooltip';

/**
 * Modify styling to hide or display the elem.
 *
 * @param elem
 * @param {Boolean} showElem
 */
const controlDisplay = function(elem, showElem) {
    elem.attr('hidden', showElem ? null : true);
};

/*
 * Renders the hydrograph on the node element using the Redux store for state information. The siteno, latitude, and
 * longitude are required parameters. All others are optional and are used to set the initial state of the hydrograph.
 * @param {Redux store} store
 * @param {DOM node} node
 * @param {Object} - string properties to set initial state information. The property siteno is required
 */
export const attachToNode = function (store,
                                      node,
                                      {
                                          siteno,
                                          latitude,
                                          longitude,
                                          parameterCode,
                                          compare,
                                          period,
                                          startDT,
                                          endDT,
                                          timeSeriesId, // This must be converted to an integer
                                          showOnlyGraph = false,
                                          showMLName = false
                                      } = {}) {
    const nodeElem = select(node);
    if (!siteno) {
        select(node).call(drawWarningAlert, {title: 'Hydrograph Alert', body: 'No data is available.'});
        return;
    }

    // Show the loading indicator
    nodeElem
        .select('.loading-indicator-container')
        .call(drawLoadingIndicator, {showLoadingIndicator: true, sizeClass: 'fa-3x'});

    // Fetch time zone
    const fetchTimeZonePromise = store.dispatch(timeZoneActions.retrieveIanaTimeZone(latitude, longitude));
    // Fetch waterwatch flood levels
    const fetchWaterWatchPromise = store.dispatch(floodDataActions.retrieveWaterwatchData(siteno));
    let fetchDataPromise;
    if (showOnlyGraph) {
        // Only fetch what is needed
        if (parameterCode && period) {
            fetchDataPromise = store.dispatch(ivTimeSeriesDataActions.retrieveCustomTimePeriodIVTimeSeries(siteno, parameterCode, period));
        } else if (parameterCode && startDT && endDT) {
            // Don't fetch until time zone is available
            fetchDataPromise = fetchTimeZonePromise.then(() => {
                return store.dispatch(ivTimeSeriesDataActions.retrieveUserRequestedIVDataForDateRange(siteno, startDT, endDT, parameterCode));
            });
        } else {
            fetchDataPromise = store.dispatch(ivTimeSeriesDataActions.retrieveIVTimeSeries(siteno, parameterCode ? [parameterCode] : null));
        }
    } else {
        // Retrieve all parameter codes for 7 days and median statistics
         fetchDataPromise = store.dispatch(ivTimeSeriesDataActions.retrieveIVTimeSeries(siteno))
            .then(() => {
                // Fetch any extended data needed to set initial state
                const currentParamCode = parameterCode ? parameterCode : getCurrentParmCd(store.getState());
                if (period === 'P30D' || period === 'P1Y') {
                    store.dispatch(ivTimeSeriesDataActions.retrieveExtendedIVTimeSeries(siteno, period, currentParamCode));
                } else if (startDT && endDT) {
                    fetchTimeZonePromise.then(() => {
                        store.dispatch(ivTimeSeriesDataActions.retrieveUserRequestedIVDataForDateRange(siteno, startDT, endDT, currentParamCode));
                    });
                }
            });
        store.dispatch(statisticsDataActions.retrieveMedianStatistics(siteno));
    }


    fetchDataPromise.then(() => {
        // Hide the loading indicator
        nodeElem
            .select('.loading-indicator-container')
            .call(drawLoadingIndicator, {showLoadingIndicator: false, sizeClass: 'fa-3x'});
        if (!hasAnyTimeSeries(store.getState())) {
            drawInfoAlert(nodeElem, {body: 'No time series data available for this site'});
        } else {
            //Update time series state
            if (parameterCode) {
                const isThisParamCode = function (variable) {
                    return variable.variableCode.value === parameterCode;
                };
                const thisVariable = Object.values(getVariables(store.getState())).find(isThisParamCode);
                store.dispatch(ivTimeSeriesStateActions.setCurrentIVVariable(thisVariable.oid));
            }
            if (compare) {
                store.dispatch(ivTimeSeriesStateActions.setIVTimeSeriesVisibility('compare', true));
            }
            if (timeSeriesId) {
                store.dispatch(ivTimeSeriesStateActions.setCurrentIVMethodID(parseInt(timeSeriesId)));
            }
            // Initial data has been fetched and initial state set. We can render the hydrograph elements
            // Set up rendering functions for the graph-container
            let graphContainer = nodeElem.select('.graph-container')
                .call(link(store, controlDisplay, hasAnyTimeSeries))
                .call(drawTimeSeriesGraph, store, siteno, showMLName, !showOnlyGraph);
            if (!showOnlyGraph) {
                graphContainer
                    .call(drawTooltipCursorSlider, store)
                    .call(drawGraphBrush, store);
            }
            graphContainer.append('div')
                .classed('ts-legend-controls-container', true)
                .call(drawTimeSeriesLegend, store);

            // Add UI interactive elements and the provisional data alert.
            if (!showOnlyGraph) {
                nodeElem
                    .call(drawMethodPicker, store)
                    .call(drawDateRangeControls, store, siteno);

                nodeElem.select('.ts-legend-controls-container')

                    .call(drawGraphControls, store);

                nodeElem.select('.select-time-series-container')
                    .call(link(store, plotSeriesSelectTable, createStructuredSelector({
                        siteno: () => siteno,
                        availableTimeSeries: availableTimeSeriesSelector,
                        lineSegmentsByParmCd: lineSegmentsByParmCdSelector('current', 'P7D'),
                        timeSeriesScalesByParmCd: timeSeriesScalesByParmCdSelector('current', 'P7D', SPARK_LINE_DIM)
                    }), store));
                nodeElem.select('.provisional-data-alert')
                    .attr('hidden', null);

                renderTimeSeriesUrlParams(store);
            }
        }
    });
};
