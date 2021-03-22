/**
 *  Module with functions for processing and structuring download link URLs
 */

import {select} from 'd3-selection';
import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import config from 'ui/config.js';
import{link}  from 'ui/lib/d3-redux';
import {getServiceURL, getServiceURLMetaData} from 'ui/web-services/instantaneous-values';
import {getServiceURLStatistics} from 'ui/web-services/statistics-data';
import {getServiceURLSGroundwater} from 'ui/web-services/groundwater-levels';

import {drawErrorAlert} from 'd3render/alerts';
import {appendInfoTooltip} from 'd3render/info-tooltip';

import {getInputsForRetrieval} from 'ml/selectors/hydrograph-state-selector';
import {getTimeRange, getMedianStatisticsData, getGroundwaterLevels, getIVData} from 'ml/selectors/hydrograph-data-selector';

import {hasVisibleIVData, hasVisibleMedianStatisticsData, hasVisibleGroundwaterLevels} from './selectors/time-series-data';
/**
* Creates a set of links with dynamically populated URLs so that users can download data that is related to the
* current hydrograph.
* @param {Object} elem - The HTML element on which the function was called.
* @param {store} store - The Redux store, in the form of a JavaScript object
* @param {String} siteno- a USGS numerical identifier for a specific monitoring location
*/
export const drawDownloadLinks = function(elem, store, siteno) {
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
        const startDT = DateTime.fromMillis(currentTimeRange.start, {zone: config.locationTimeZone}).toISO();
        const endDT = DateTime.fromMillis(currentTimeRange.end, {zone: config.locationTimeZone}).toISO();

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
                        siteno: siteno,
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
                        siteno: siteno,
                        parameterCode:  inputs.parameterCode,
                        startTime: DateTime.fromMillis(priorYearTimeRange.start, {zone: config.locationTimeZone}).toISO(),
                        endTime: DateTime.fromMillis(priorYearTimeRange.end, {zone: config.locationTimeZone}).toISO(),
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
                        parameterCode: inputs.parameterCode,
                        statType: 'median',
                        format: 'rdb'
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
                        endDT: endDT,
                        format: 'rdb'
                    }),
                    gaEventAction: 'downloadLinkGroundwaterLevels',
                    tooltipText: 'Field visit data as shown on the graph'
                });
        }

        const metadataDownloadLink = listOfDownloadLinks.append('li')
            .text('Metadata - ')
            .call(createDataDownloadLink, {
                displayText: 'standard',
                url: getServiceURLMetaData({
                    siteno: siteno,
                    isExpanded: false
                }),
                gaEventAction: 'downloadLinkMetadataStandard',
                tooltipText: ''
            });
        metadataDownloadLink.append('span')
            .text(' or ');
        metadataDownloadLink
            .call(createDataDownloadLink, {
                displayText: 'expanded',
                url: getServiceURLMetaData({
                    siteno: siteno,
                    isExpanded: true
                }),
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

const drawCheckbox = function(container, inputID, label, value) {
    const checkboxContainer = container.append('div')
        .attr('class', 'usa-checkbox');
    checkboxContainer.append('input')
        .attr('class', 'usa-checkbox__input')
        .attr('id', inputID)
        .attr('type', 'checkbox')
        .attr('value', value);
    checkboxContainer.append('label')
        .attr('class', 'usa-checkbox__label')
        .attr('for', inputID)
        .text(label);
};

const drawCheckboxes = function(container, {
    hasVisiblePrimaryIVData,
    hasVisibleCompareIVData,
    hasVisibleMedianData,
    hasVisibleGroundwaterLevels
}) {
    container.select('.download-checkbox-container').remove();
    const checkboxContainer = container.append('div')
        .attr('class', 'download-checkbox-container');
    if (hasVisiblePrimaryIVData) {
        checkboxContainer.call(drawCheckbox, 'download-primary-iv-data', 'Current IV', 'primary');
    }
    if (hasVisibleCompareIVData) {
        checkboxContainer.call(drawCheckbox, 'download-compare-iv-data', 'Prior year IV', 'compare');
    }
    if (hasVisibleMedianData) {
        checkboxContainer.call(drawCheckbox, 'download-median-data', 'Median', 'median');
    }
    if (hasVisibleGroundwaterLevels) {
        checkboxContainer.call(drawCheckbox, 'download-field-visits', 'Field visits', 'groundwater-levels');
    }
    checkboxContainer.call(drawCheckbox, 'download-site-meta-data', 'About this location', 'site');
};

export const drawDownloadForm = function(container, store, siteno) {
    const formContainer = container.append('form')
        .attr('class', 'usa-form')
        .append('fieldset')
            .attr('class', 'usa-fieldset');
    formContainer.append('legend')
        .attr('class', 'usa-legend')
        .text('Select data to be downloaded');
    formContainer.call(link(store, drawCheckboxes, createStructuredSelector({
        hasVisiblePrimaryIVData: hasVisibleIVData('primary'),
        hasVisibleCompareIVData: hasVisibleIVData('compare'),
        hasVisibleMedianData: hasVisibleMedianStatisticsData,
        hasVisibleGroundwaterLevels: hasVisibleGroundwaterLevels
    })));

    const downloadButton = container.append('button')
        .attr('class', 'usa-button download-selected-data')
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'download-selected-data')
        .attr('ga-event-action', 'download')
        .on('click', function() {
            container.selectAll('.alert-error-container').remove();
            const checkedInputs = formContainer.selectAll('input[type="checkbox"]:checked');
            if (checkedInputs.size()) {
                checkedInputs.each(function() {
                    switch (select(this).attr('value')) {
                        case 'primary':
                        case 'compare':
                        case 'median':
                        case 'groundwater-levels':
                        case 'site':
                            console.log(`Downloading data for ${select(this).attr('value')}`);
                            break;
                        default:
                            console.log('Unexpected value');
                    }
                });
            } else {
                container.insert('div', 'button')
                    .attr('class', 'alert-error-container')
                    .call(drawErrorAlert, {
                        body:'Please select one or more checkboxes',
                        useSlim: true
                    });
            }
        });
    downloadButton.append('i')
        .attr('class', 'fas fa-file-download')
        .attr('aria-hidden', true)
        .attr('role', 'img');
    downloadButton.append('span').text('Download');
};
