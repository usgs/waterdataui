/**
 *  Module with functions for processing and structuring download link URLs
 */
import {createStructuredSelector} from 'reselect';

import config from 'ui/config.js';
import{link}  from 'ui/lib/d3-redux';

import {appendInfoTooltip} from 'd3render/info-tooltip';

import {getCurrentParmCd, getCurrentDateRange, getShowIVTimeSeries} from 'ml/selectors/time-series-selector';

import {getQueryInformation} from './selectors/time-series-data';

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
    elem.call(link(store, (elem, {currentIVDateRange, parameterCode, showIVTimeSeries, queryInformation}) => {
        elem.select('#iv-data-download-list').remove();

        const addStandardAttributes = function(element) {
            return element.attr('class', 'usa-link')
                .attr('target', '_blank')
                .attr('rel', 'noopener');
        };

        const listOfDownloadLinks = elem.append('ul')
            .attr('id', 'iv-data-download-list')
            .attr('class', 'usa-fieldset usa-list--unstyled');

        const monitoringLocationDownloadLink = listOfDownloadLinks.append('li');
        addStandardAttributes(monitoringLocationDownloadLink.append('a'))
            .text('Current')
            .attr('href', createUrlForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'current'))
            .attr('ga-on', 'click')
            .attr('ga-event-category', 'links')
            .attr('ga-event-action', 'downloadLinkCurrent');
        monitoringLocationDownloadLink.call(appendInfoTooltip, 'Monitoring location data as shown on graph');

        if (showIVTimeSeries.compare) {
            const compareDownloadLink = listOfDownloadLinks.append('li');
            addStandardAttributes(compareDownloadLink.append('a'))
                .text('Compare')
                .attr('href', createUrlForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'compare'))
                .attr('ga-on', 'click')
                .attr('ga-event-category', 'links')
                .attr('ga-event-action', 'downloadLinkCompare');
            compareDownloadLink.call(appendInfoTooltip, 'Data from last year with the same duration as in graph');
        }

        if (showIVTimeSeries.median && parameterCode === '00060') {
            const medianDownloadLink = listOfDownloadLinks.append('li');
            addStandardAttributes(medianDownloadLink.append('a'))
                .text('Median')
                .attr('href', `${config.SERVICE_ROOT}/stat/?format=rdb&sites=${siteno}&statReportType=daily&statTypeCd=median&parameterCd=00060`)
                .attr('ga-on', 'click')
                .attr('ga-event-category', 'links')
                .attr('ga-event-action', 'downloadLinkMedian');
            medianDownloadLink.call(appendInfoTooltip, 'Median data for timespan shown on graph');
        }

        const metadataDownloadLink = listOfDownloadLinks.append('li')
            .text('Metadata - ');
        addStandardAttributes(metadataDownloadLink.append('a'))
            .text('standard')
            .attr('href', `${config.SERVICE_ROOT}/site/?format=rdb&sites=${siteno}&siteStatus=all`)
            .attr('ga-on', 'click')
            .attr('ga-event-category', 'links')
            .attr('ga-event-action', 'downloadLinkMetadataStandard');
        metadataDownloadLink.append('span')
            .text(' or ');
        addStandardAttributes(metadataDownloadLink.append('a'))
            .text('expanded')
            .attr('href', `${config.SERVICE_ROOT}/site/?format=rdb&sites=${siteno}&siteOutput=expanded&siteStatus=all`)
            .attr('ga-on', 'click')
            .attr('ga-event-category', 'links')
            .attr('ga-event-action', 'downloadLinkMetadataExpanded');
        metadataDownloadLink.call(appendInfoTooltip, 'Information about this monitoring location');

    },  createStructuredSelector({
        currentIVDateRange: getCurrentDateRange,
        parameterCode: getCurrentParmCd,
        showIVTimeSeries: getShowIVTimeSeries,
        queryInformation: getQueryInformation
    })));
};
