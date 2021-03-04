/**
 *  Module with functions for processing and structuring download link URLs
 */

import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import config from 'ui/config.js';
import{link}  from 'ui/lib/d3-redux';
import  {getServiceURL} from 'ui/web-services/instantaneous-values';

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
export const renderDownloadLinks = function(elem, store, siteno) {
    const monitoringLocations = [siteno];
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

        if (hasIVData && primaryIVData && Object.keys(primaryIVData.values) > 0) {
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Current IV data',
                    // url: `${config.SERVICE_ROOT}/iv/?sites=${siteno}&parameterCd=${inputs.parameterCode}&startDT=${startDT}&endDT=${endDT}&siteStatus=all&format=rdb`,
                    url: getServiceURL({
                        monitoringLocations: monitoringLocations,
                        parameterCode: inputs.parameterCode,
                        startTime: startDT,
                        endTime: endDT
                    }),
                    gaEventAction: 'downloadLinkCurrent',
                    tooltipText: 'Monitoring location data as shown on graph'
                });
        }

        if (inputs.loadCompare && compareIVData && Object.keys(compareIVData.values) > 0) {
            const priorYearStartDT = DateTime.fromMillis(priorYearTimeRange.start).toISO();
            const priorYearEndDT = DateTime.fromMillis(priorYearTimeRange.end).toISO();

            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Compare IV data',
                    url: `${config.SERVICE_ROOT}/iv/?sites=${siteno}&parameterCd=${inputs.parameterCode}&startDT=${priorYearStartDT}&endDT=${priorYearEndDT}&siteStatus=all&format=rdb`,
                    gaEventAction: 'downloadLinkCompare',
                    tooltipText: 'Data from last year with the same duration as in graph'
                });
        }

        if (inputs.loadMedian && medianStatisticsData && Object.keys(medianStatisticsData) > 0) {
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Median data',
                    url: `${config.SERVICE_ROOT}/stat/?format=rdb&sites=${siteno}&startDT=${startDT.split('T')[0]}&endDT=${endDT.split('T')[0]}&statReportType=daily&statTypeCd=median&parameterCd=${inputs.parameterCode}`,
                    gaEventAction: 'downloadLinkMedian',
                    tooltipText: 'Median data for timespan shown on graph'
                });
        }

        if (hasGWData && groundwaterPoints && groundwaterPoints.values.length > 0) {
            listOfDownloadLinks.append('li')
                .call(createDataDownloadLink, {
                    displayText: 'Field visit data',
                    url: `${config.GROUNDWATER_LEVELS_ENDPOINT}?sites=${siteno}&parameterCd=${inputs.parameterCode}&startDT=${startDT}&endDT=${endDT}&format=rdb`,
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
