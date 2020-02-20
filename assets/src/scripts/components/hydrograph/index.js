/**
 * Hydrograph charting module.
 */
import {select} from 'd3-selection';

import {createStructuredSelector} from 'reselect';

import {drawWarningAlert, drawInfoAlert} from '../../d3-rendering/alerts';
import {link} from '../../lib/d3-redux';
import {isLoadingTS, hasAnyTimeSeries, getTimeSeries, getCurrentParmCd,
    getVariables} from '../../selectors/time-series-selector';
import {Actions} from '../../store';

import {cursorSlider} from './cursor';
import {drawDateRangeControls} from './date-controls';
import {lineSegmentsByParmCdSelector} from './drawing-data';
import {drawGraphBrush} from './graph-brush';
import {drawGraphControls} from './graph-controls';
import {SPARK_LINE_DIM}  from './layout';
import {drawTimeSeriesLegend} from './legend';
import {drawLoadingIndicator} from '../../d3-rendering/loading-indicator';
import {drawMethodPicker} from './method-picker';
import {plotSeriesSelectTable, availableTimeSeriesSelector} from './parameters';
import {timeSeriesScalesByParmCdSelector} from './scales';
import {drawTimeSeriesGraph} from './time-series-graph';


/**
 * Modify styling to hide or display the elem.
 *
 * @param elem
 * @param {Boolean} showElem
 */
const controlDisplay = function(elem, showElem) {
    elem.attr('hidden', showElem ? null : true);
};


export const attachToNode = function (store,
                                      node,
                                      {
                                          siteno,
                                          parameterCode,
                                          compare,
                                          period,
                                          startDT,
                                          endDT,
                                          showOnlyGraph = false,
                                          showMLName = false
                                      } = {}) {
    const nodeElem = select(node);
    if (!siteno) {
        select(node).call(drawWarningAlert, {title: 'Hydrograph Alert', body: 'No data is available.'});
        return;
    }

    // Initialize hydrograph with the store and show the loading indicator
    store.dispatch(Actions.resizeUI(window.innerWidth, node.offsetWidth));
    nodeElem
        .select('.loading-indicator-container')
            .call(link(store, drawLoadingIndicator, createStructuredSelector({
                showLoadingIndicator: isLoadingTS('current', 'P7D'),
                sizeClass: () => 'fa-3x'
            })));

    let fetchPromise;
    if (showOnlyGraph) {
        // Only fetch what is needed
        if (parameterCode && period) {
            fetchPromise = store.dispatch(Actions.retrieveCustomTimePeriodTimeSeries(siteno, parameterCode, period));
        } else if (parameterCode && startDT && endDT) {
            fetchPromise = store.dispatch(Actions.retrieveDataForDateRange(siteno, startDT, endDT, parameterCode));
        } else {
            fetchPromise = store.dispatch(Actions.retrieveTimeSeries(siteno, parameterCode ? [parameterCode] : null));
        }
    } else {
        // Retrieve all parameter codes for 7 days and median statistics
        fetchPromise = store.dispatch(Actions.retrieveTimeSeries(siteno))
            .then(() => {
                // Fetch any extended data needed to set initial state
                const currentParamCode = parameterCode ? parameterCode : getCurrentParmCd(store.getState());
                if (period === 'P30D' || period === 'P1Y') {
                    store.dispatch(Actions.retrieveExtendedTimeSeries(siteno, period, currentParamCode));
                } else if (startDT && endDT) {
                    store.dispatch(Actions.retrieveDataForDateRange(siteno, startDT, endDT, currentParamCode));
                }
            });
        store.dispatch(Actions.retrieveMedianStatistics(siteno));
    }
    fetchPromise.then(() => {
        if (!hasAnyTimeSeries(store.getState())) {
            drawInfoAlert(nodeElem, {body: 'No time series data available for this site'});
        } else {
            //Update time series state
            if (parameterCode) {
                const isThisParamCode = function(variable) {
                    return variable.variableCode.value === parameterCode;
                };
                const thisVariable = Object.values(getVariables(store.getState())).find(isThisParamCode);
                store.dispatch(Actions.setCurrentVariable(thisVariable.oid));
            }
            if (compare) {
                store.dispatch(Actions.toggleTimeSeries('compare', true));
            }
        }
    });
    // Set currentDateRange prior to rendering so initial state is correct
    if (period || (startDT && endDT)) {
        store.dispatch(Actions.setCurrentDateRange(period ? period : 'custom'));
        store.dispatch(Actions.setCustomDateRange())
    }

    // Set up rendering functions for the graph-container
    let graphContainer = nodeElem.select('.graph-container')
        .call(link(store, controlDisplay, hasAnyTimeSeries))
        .call(drawTimeSeriesGraph, store, siteno, showMLName);
    if (!showOnlyGraph) {
        graphContainer.call(cursorSlider, store);
        graphContainer.call(drawGraphBrush, store);
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
            .call(link(store, function(elem, allTimeSeries) {
                elem.attr('hidden', Object.keys(allTimeSeries).length ? null : true);
            }, getTimeSeries));
    }

    window.onresize = function() {
        store.dispatch(Actions.resizeUI(window.innerWidth, node.offsetWidth));
    };
};
