/**
 * Hydrograph charting module.
 */
import {select} from 'd3-selection';
import {createStructuredSelector} from 'reselect';

import {DateTime} from 'luxon';

import config from 'ui/config.js';
import {drawWarningAlert, drawInfoAlert} from 'd3render/alerts';
import {drawLoadingIndicator} from 'd3render/loading-indicator';
import {link} from 'ui/lib/d3-redux';

import {getIanaTimeZone} from 'ml/selectors/time-zone-selector';

import {hasAnyTimeSeries, getCurrentParmCd, getVariables, getCurrentDateRange, getCustomTimeRange, getShowIVTimeSeries, getUserInputsForSelectingTimespan} from 'ml/selectors/time-series-selector';
import {Actions as ivTimeSeriesDataActions} from 'ml/store/instantaneous-value-time-series-data';
import {Actions as ivTimeSeriesStateActions} from 'ml/store/instantaneous-value-time-series-state';
import {Actions as statisticsDataActions} from 'ml/store/statistics-data';
import {Actions as timeZoneActions} from 'ml/store/time-zone';
import {Actions as floodDataActions} from 'ml/store/flood-inundation';
import {renderTimeSeriesUrlParams} from 'ml/url-params';

import {drawDateRangeControls} from 'ivhydrograph/date-controls';
import {drawDataTable} from 'ivhydrograph/data-table';
import {drawGraphBrush} from 'ivhydrograph/graph-brush';
import {drawGraphControls} from 'ivhydrograph/graph-controls';
import {SPARK_LINE_DIM}  from 'ivhydrograph/selectors/layout';
import {drawTimeSeriesLegend} from 'ivhydrograph/legend';
import {drawMethodPicker} from 'ivhydrograph/method-picker';
import {plotSeriesSelectTable} from 'ivhydrograph/parameters';
import {getLineSegmentsByParmCd} from 'ivhydrograph/selectors/drawing-data';
import {getAvailableParameterCodes} from 'ivhydrograph/selectors/parameter-data';
import {getTimeSeriesScalesByParmCd} from 'ivhydrograph/selectors/scales';
import {getQueryInformation} from 'ivhydrograph/selectors/time-series-data';
import {drawTimeSeriesGraph} from 'ivhydrograph/time-series-graph';
import {drawTooltipCursorSlider} from 'ivhydrograph/tooltip';
import {isPeriodWithinAcceptableRange, isPeriodCustom} from 'ivhydrograph/hydrograph-utils';

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
export const attachToNode = function(store,
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

    /*
    * Converts a numerical time representation to a calendar date format
    * @param {Object} customTimeRange - A numerical time indicator than can be converted to date format
    * @param {String} ianaTimeZone - A geographical reference to the user's timezone
    * @return {Object} Contains the start and end calendar dates
    */
    const convertedTimeToDate = function(customTimeRange, ianaTimeZone) {
        return {
            start: DateTime.fromMillis(customTimeRange.start, {zone: ianaTimeZone.timeZone}).toFormat('yyyy-LL-dd'),
            end: DateTime.fromMillis(customTimeRange.end, {zone: ianaTimeZone.timeZone}).toFormat('yyyy-LL-dd')
        };
    };

    /*
    * Assembles the href/URL needed to contact WaterServices and return data related to the currently showing hydrograph
    * @param {String} currentIVDateRange - The string will be in the form of P{number of days}D (like P7D) or P1Y or 'custom'
    * If the value is 'custom', it means that the user selected the timespan in calendar days
    * @param {Object} customTimeRange - A numerical time indicator than can be converted to date format
    * This will only have a value if the currentIVDateRange is custom
    * @param {String} ianaTimeZone - A geographical reference to the user's timezone
    * @param {String} parameterCode - the five digit code for the current hydrograph parameter
    * @ return a URL formatted to return data from WaterServices that matches the currently displayed hydrograph
    */
    const stationDataDownloadURL = function(currentIVDateRange, customTimeRange, ianaTimeZone, parameterCode) {
        console.log('currentIVDateRange ', currentIVDateRange)
        if (currentIVDateRange === 'custom') {
            const convertedTimeDate = convertedTimeToDate(customTimeRange, ianaTimeZone);
            return `${config.WATER_SERVICES}/?format=rdb&sites=${siteno}&startDT=${convertedTimeDate.start}&endDT=${convertedTimeDate.end}&parameterCd=${parameterCode}&siteStatus=all`;
        } else {
            return `${config.WATER_SERVICES}/?format=rdb&sites=${siteno}&period=${currentIVDateRange}&parameterCd=${parameterCode}&siteStatus=all`;
        }
    };

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
    store.dispatch(floodDataActions.retrieveWaterwatchData(siteno));
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
                // If there are query parameters present, use them but restrict them to the form of PxD or P1Y
                if (isPeriodWithinAcceptableRange(period)) {
                    isPeriodCustom(period) ?
                        store.dispatch(ivTimeSeriesDataActions.retrieveCustomTimePeriodIVTimeSeries(siteno, parameterCode, period)) :
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
            if (!showOnlyGraph) {
                document.getElementById('classic-page-link')
                    .setAttribute('href', `${config.NWIS_INVENTORY_ENDPOINT}?site_no=${siteno}`);
            }
        } else {
            //Update time series state
            if (parameterCode) {
                const isThisParamCode = function(variable) {
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

            // Add UI interactive elements, data table  and the provisional data alert.
            if (!showOnlyGraph) {
                nodeElem
                    .call(drawMethodPicker, store)
                    .call(drawDateRangeControls, store, siteno);

                nodeElem.select('.ts-legend-controls-container')
                    .call(drawGraphControls, store);
                // Construct and add the hrefs needed so users can download the data corresponding to the currently displayed hydrograph with the 'download data' links
                nodeElem.select('#iv-download-container').call(link(store, (container, {currentIVDateRange, customTimeRange, ianaTimeZone, parameterCode, showIVTimeSeries, queryInformation, userInputsForSelectingTimespan}) => {


                    nodeElem.select('#station-compare-data-download-link').text('').attr('href', '');
                    nodeElem.select('#median-data-download-link').text('').attr('href', '');
                    const href = `${config.WATER_SERVICES}/?format=rdb&sites=${siteno}&period=${currentIVDateRange}&parameterCd=${parameterCode}&siteStatus=all`;
                    nodeElem.select('#station-data-download-link')
                        .attr('href', href);

                    if (showIVTimeSeries.compare && currentIVDateRange !== 'custom') {
                        const objectNameForCompare = `compare:${currentIVDateRange}:${parameterCode}`;
                        console.log('objectNameForCompare', objectNameForCompare)
                        // console.log('test ', queryInformation[objectNameForCompare])
                        //
                        // let hrefForCurrentStationData = queryInformation[objectNameForCompare].queryURL;
                        // console.log('query ', hrefForCurrentStationData)
                        // hrefForCurrentStationData = hrefForCurrentStationData.replace('json', 'rdb');
                        // console.log('hrefForCurrentStationData ', hrefForCurrentStationData)
                        // const href = `${config.WATER_SERVICES}/?format=rdb&sites=${siteno}&startDT=${convertedTimeDate.start}&endDT=${convertedTimeDate.end}&parameterCd=${parameterCode}&siteStatus=all`;


                        nodeElem.select('#station-compare-data-download-link')
                            .text('Station - compare to last year');
                    }

                    if (showIVTimeSeries.median && parameterCode === '00060') {
                        nodeElem.select('#median-data-download-link')
                            .text('Median')
                            .attr('href', '//waterservices.usgs.gov/nwis/iv/?format=rdb&sites=01646500&parameterCd=00060&siteStatus=all');
                    }
                },  createStructuredSelector({
                    currentIVDateRange: getCurrentDateRange,
                    customTimeRange: getCustomTimeRange,
                    ianaTimeZone: getIanaTimeZone,
                    parameterCode: getCurrentParmCd,
                    showIVTimeSeries: getShowIVTimeSeries,
                    queryInformation: getQueryInformation,
                    userInputsForSelectingTimespan: getUserInputsForSelectingTimespan
                })));


                nodeElem.select('#metadata-download-link').attr('href', '//waterservices.usgs.gov/nwis/iv/?format=rdb&sites=01646500&parameterCd=00060&siteStatus=all');
                nodeElem.select('#iv-data-table-container')
                    .call(drawDataTable, store);
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
        }
    });
};
