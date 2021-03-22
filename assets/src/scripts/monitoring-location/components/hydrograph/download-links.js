/**
 *  Module with functions for processing and structuring download link URLs
 */

import {select} from 'd3-selection';
import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import config from 'ui/config.js';
import{link}  from 'ui/lib/d3-redux';
import {getIVServiceURL, getSiteMetaDataServiceURL} from 'ui/web-services/instantaneous-values';
import {getStatisticsServiceURL} from 'ui/web-services/statistics-data';
import {getGroundwaterServiceURL} from 'ui/web-services/groundwater-levels';

import {drawErrorAlert} from 'd3render/alerts';

import {getTimeRange, getPrimaryParameter} from 'ml/selectors/hydrograph-data-selector';

import {hasVisibleIVData, hasVisibleMedianStatisticsData, hasVisibleGroundwaterLevels} from './selectors/time-series-data';

const toISO = function(inMillis) {
    return DateTime.fromMillis(inMillis, {zone: config.locationTimeZone}).toISO();
};

const getIVDataURL =  function(store, siteno, timeRangeKind) {
    const currentState = store.getState();
    const timeRange = getTimeRange(timeRangeKind)(currentState);

    return getIVServiceURL({
        siteno,
        parameterCode: getPrimaryParameter(currentState).parameterCode,
        startDT: toISO(timeRange.start),
        endDT: toISO(timeRange.end),
        format: 'rdb'
    });
};

const getMedianDataURL = function(store, siteno) {
    return getStatisticsServiceURL({
        siteno,
        parameterCode: getPrimaryParameter(store.getState()).parameterCode,
        stat_type: 'median',
        format: 'rdb'
    });
};

const getGroundwaterLevelURL = function(store, siteno) {
    const currentState = store.getState();
    const timeRange = getTimeRange('current')(currentState);

    return getGroundwaterServiceURL({
        siteno,
        parameterCode: getPrimaryParameter(currentState).parameterCode,
        startDT: toISO(timeRange.start),
        endDT: toISO(timeRange.end),
        format: 'rdb'
    });
};

const getSiteMetaDataURL = function(siteno) {
    return getSiteMetaDataServiceURL({
        siteno,
        isExpanded: true
    });
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
    formContainer.append('div')
        .attr('class', 'select-data-input-container')
        .call(link(store, drawCheckboxes, createStructuredSelector({
            hasVisiblePrimaryIVData: hasVisibleIVData('primary'),
            hasVisibleCompareIVData: hasVisibleIVData('compare'),
            hasVisibleMedianData: hasVisibleMedianStatisticsData,
            hasVisibleGroundwaterLevels: hasVisibleGroundwaterLevels
        })));

    const downloadButton = formContainer.append('button')
        .attr('class', 'usa-button download-selected-data')
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'download-selected-data')
        .attr('ga-event-action', 'download')
        .on('click', function() {
            formContainer.selectAll('.alert-error-container').remove();
            const checkedInputs = formContainer.selectAll('input[type="checkbox"]:checked');
            if (checkedInputs.size()) {
                checkedInputs.each(function() {
                    let downloadUrl;
                    switch (select(this).attr('value')) {
                        case 'primary':
                            downloadUrl = getIVDataURL(store, siteno, 'current');
                            break;
                        case 'compare':
                            downloadUrl = getIVDataURL(store, siteno, 'prioryear');
                            break;
                        case 'median':
                            downloadUrl = getMedianDataURL(store, siteno);
                            break;
                        case 'groundwater-levels':
                            downloadUrl = getGroundwaterLevelURL(store, siteno);
                            break;
                        case 'site':
                            downloadUrl = getSiteMetaDataURL(siteno);
                            break;
                        default:
                            console.log('Unexpected value');
                    }
                    if (downloadUrl) {
                        window.open(downloadUrl, '_blank');
                    }
                });
            } else {
                formContainer.insert('div', 'button')
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
