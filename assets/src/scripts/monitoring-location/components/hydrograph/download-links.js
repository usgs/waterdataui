/**
 *  Module with functions for processing and structuring download link URLs
 */
import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import config from 'ui/config.js';
import{link}  from 'ui/lib/d3-redux';

import {appendInfoTooltip} from 'd3render/info-tooltip';

import {getQueryInfo, getCurrentParmCd, getCurrentDateRange, getShowIVTimeSeries,
    getRequestTimeRange} from 'ml/selectors/time-series-selector';
import {getCurrentVariableMedianStatistics} from 'ml/selectors/median-statistics-selector';

import {anyVisibleGroundwaterLevels} from './selectors/discrete-data';

/**
 * Uses information from the state to structure a URL that will work with WaterServices
 * @param {String} currentIVDateRange - a string with the form of 'P{a number of days}D, 'P1Y', or 'custom'
 * @param {Object} queryInformation - from the application state, contains
 * URL queries for WaterServices - but they require reformatting to use
 * @param {String} parameterCode - a five digit number (in string form) indicating the type of time series data
 * @param {String} timeSeriesType - one of two options, 'current' or 'compare'
 * @return {String} a URL usable to retrieve station data from WaterServices
 */
const createUrlForDownloadLinks = function(currentIVDateRange, queryInformation, parameterCode, timeSeriesType) {
    let url = '';
    const key = currentIVDateRange === 'P7D' ? `${timeSeriesType}:${currentIVDateRange}` : `${timeSeriesType}:${currentIVDateRange}:${parameterCode}`;

    if (queryInformation[key]) {
        url =  queryInformation[key];
        url = url.queryURL;
        const splitUrl = url.split('/nwis/iv/');
        url = splitUrl[1];
        url = url.replace('json', 'rdb');
        url = `${config.SERVICE_ROOT}/iv/?${url}`;
    }
    // For the URLs in the state that don't have a parameter code, like the P7Ds, let's add it
    if (!url.includes('parameterCd')) {
        url = url + `&parameterCd=${parameterCode}`;
    }

    return url;
};

/**
* Creates a set of links with dynamically populated URLs so that users can download data that is related to the
* current hydrograph.
* @param {Object} elem - The HTML element on which the function was called.
* @param {store} store - The Redux store, in the form of a JavaScript object
* @param {String} siteno- a USGS numerical identifier for a specific monitoring location
*/

export const renderDownloadLinks = function(elem, store, siteno) {
    elem.call(link(store, (elem, {
        currentIVDateRange,
        parameterCode,
        showIVTimeSeries,
        queryInformation,
        medianData,
        anyVisibleGroundwaterLevels,
        requestTimeRange
    }) => {
        const hasIVData = config.ivPeriodOfRecord && parameterCode in config.ivPeriodOfRecord;
        const hasGWData = config.gwPeriodOfRecord && parameterCode in config.gwPeriodOfRecord;

        elem.select('#iv-data-download-list').remove();

        const listOfDownloadLinks = elem.append('ul')
            .attr('id', 'iv-data-download-list')
            .attr('class', 'usa-fieldset usa-list--unstyled');

        const createDataDownloadLink = function(elem, {displayText, url, gaEventAction, tooltipText}) {
            elem.append('a')
                .text(displayText)
                .attr('target', '_blank')
                .attr('rel', 'noopener')
                .attr('href', url)
                .attr('ga-on', 'click')
                .attr('ga-event-category', 'links')
                .attr('ga-event-action', gaEventAction);
                if (tooltipText) {
                    elem.call(appendInfoTooltip, tooltipText);
                }
        };

        if (hasIVData) {
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Current IV data',
                    url: createUrlForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'current'),
                    gaEventAction: 'downloadLinkCurrent',
                    tooltipText: 'Monitoring location data as shown on graph'
                });
        }

        if (hasIVData && showIVTimeSeries.compare) {
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Compare IV data',
                    url: createUrlForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'compare'),
                    gaEventAction: 'downloadLinkCompare',
                    tooltipText: 'Data from last year with the same duration as in graph'
                });
        }

        if (showIVTimeSeries.median && medianData) {
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Median data',
                    url: `${config.SERVICE_ROOT}/stat/?format=rdb&sites=${siteno}&statReportType=daily&statTypeCd=median&parameterCd=${parameterCode}`,
                    gaEventAction: 'downloadLinkMedian',
                    tooltipText: 'Median data for timespan shown on graph'
                });
        }

        if (hasGWData && anyVisibleGroundwaterLevels) {
            const startDT = DateTime.fromMillis(requestTimeRange.start).toISO();
            const endDT = DateTime.fromMillis(requestTimeRange.end).toISO();
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Field visit data',
                    url: `${config.GROUNDWATER_LEVELS_ENDPOINT}?sites=${siteno}&parameterCd=${parameterCode}&startDT=${startDT}&endDT=${endDT}&format=rdb`,
                    gaEventAction: 'downloadLinkGroundwaterLevels',
                    tooltipText: 'Field visit data as shown on the graph'
                });
        }

        const metadataDownloadLink = listOfDownloadLinks.append('li')
            .text('Metadata - ')
            .call(createDataDownloadLink, {
                displayText: 'standard',
                url: `${config.SERVICE_ROOT}/site/?format=rdb&sites=${siteno}&siteStatus=all`,
                gaEventAction: 'downloadLinkMetadataStandard',
                tooltipText: ''
            });
        metadataDownloadLink.append('span')
            .text(' or ');
        metadataDownloadLink
            .call(createDataDownloadLink, {
                displayText: 'expanded',
                url: `${config.SERVICE_ROOT}/site/?format=rdb&sites=${siteno}&siteOutput=expanded&siteStatus=all`,
                gaEventAction: 'downloadLinkMetadataExpanded',
                tooltipText: 'Information about this monitoring location'
            });
    },  createStructuredSelector({
        currentIVDateRange: getCurrentDateRange,
        parameterCode: getCurrentParmCd,
        showIVTimeSeries: getShowIVTimeSeries,
        queryInformation: getQueryInfo,
        medianData: getCurrentVariableMedianStatistics,
        anyVisibleGroundwaterLevels: anyVisibleGroundwaterLevels,
        requestTimeRange: getRequestTimeRange('current')
    })));
};
