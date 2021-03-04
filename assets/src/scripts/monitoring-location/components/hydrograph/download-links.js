/**
 *  Module with functions for processing and structuring download link URLs
 */

import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import config from 'ui/config.js';
import{link}  from 'ui/lib/d3-redux';
import {getServiceURL} from 'ui/web-services/instantaneous-values';
import {getServiceURLStatistics} from 'ui/web-services/statistics-data';
import {getServiceURLSGroundwater} from 'ui/web-services/groundwater-levels';

import {appendInfoTooltip} from 'd3render/info-tooltip';
import {getInputsForRetrieval} from 'ml/selectors/hydrograph-state-selector';
import {getTimeRange, getMedianStatisticsData, getGroundwaterLevels, getIVData} from 'ml/selectors/hydrograph-data-selector';


/**
* Creates a set of links with dynamically populated URLs so that users can download data that is related to the
* current hydrograph.
* @param {Object} elem - The HTML element on which the function was called.
* @param {store} store - The Redux store, in the form of a JavaScript object
* @param {String} siteno- a USGS numerical identifier for a specific monitoring location
*/
export const drawDownloadLinks = function(elem, store, siteno) {
    const monitoringLocations = [siteno]; // The method that processes the service URL expects an array of locations

    elem.call(link(store, (elem, {
        currentTimeRange,
        priorYearTimeRange,
        inputs,
        medianStatisticsData,
        groundwaterPoints,
        primaryIVData,
        compareIVData
    }) => {
        const hasIVData = config.ivPeriodOfRecord && inputs.parameterCode in config.ivPeriodOfRecord;
        const hasGWData = config.gwPeriodOfRecord && inputs.parameterCode in config.gwPeriodOfRecord;
        const startDT = DateTime.fromMillis(currentTimeRange.start).toISO();
        const endDT = DateTime.fromMillis(currentTimeRange.end).toISO();

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

        if (hasIVData && primaryIVData && Object.keys(primaryIVData.values).length) {
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Current IV data',
                    url: getServiceURL({
                        monitoringLocations: monitoringLocations,
                        parameterCode: inputs.parameterCode,
                        startTime: startDT,
                        endTime: endDT,
                        format: 'rdb'
                    }),
                    gaEventAction: 'downloadLinkCurrent',
                    tooltipText: 'Monitoring location data as shown on graph'
                });
        }

        if (inputs.loadCompare && compareIVData && Object.keys(compareIVData.values).length) {
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Compare IV data',
                    url: getServiceURL({
                        monitoringLocations: monitoringLocations,
                        parameterCode: inputs.parameterCode,
                        startTime: DateTime.fromMillis(priorYearTimeRange.start).toISO(),
                        endTime: DateTime.fromMillis(priorYearTimeRange.end).toISO(),
                        format: 'rdb'
                    }),
                    gaEventAction: 'downloadLinkCompare',
                    tooltipText: 'Data from last year with the same duration as in graph'
                });
        }

        if (inputs.loadMedian && medianStatisticsData && Object.keys(medianStatisticsData).length) {
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Median data',
                    url: getServiceURLStatistics({
                        siteno: siteno,
                        parameterCode: inputs.parameterCode
                    }),
                    gaEventAction: 'downloadLinkMedian',
                    tooltipText: 'All Median data'
                });
        }

        if (hasGWData && groundwaterPoints && groundwaterPoints.values.length) {
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Field visit data',
                    url: getServiceURLSGroundwater({
                        siteno: siteno,
                        parameterCode: inputs.parameterCode,
                        startDT: startDT,
                        endDT: endDT
                    }),
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
        currentTimeRange: getTimeRange('current'),
        priorYearTimeRange: getTimeRange('prioryear'),
        inputs: getInputsForRetrieval,
        medianStatisticsData: getMedianStatisticsData,
        groundwaterPoints: getGroundwaterLevels,
        primaryIVData: getIVData('primary'),
        compareIVData: getIVData('compare')
    })));
};
