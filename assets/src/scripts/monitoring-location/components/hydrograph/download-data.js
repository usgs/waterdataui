/**
 *  Module with functions for processing and structuring download link URLs
 */

import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import config from 'ui/config.js';
import {link}  from 'ui/lib/d3-redux';
import {getIVServiceURL, getSiteMetaDataServiceURL} from 'ui/web-services/instantaneous-values';
import {getStatisticsServiceURL} from 'ui/web-services/statistics-data';
import {getGroundwaterServiceURL} from 'ui/web-services/groundwater-levels';

import {drawErrorAlert} from 'd3render/alerts';

import {getTimeRange, getPrimaryParameter} from 'ml/selectors/hydrograph-data-selector';

import {hasVisibleIVData, hasVisibleMedianStatisticsData, hasVisibleGroundwaterLevels} from './selectors/time-series-data';

const INFO_TEXT = `
<div>
    A separate tab will open with the requested data.
</div>
<div>
    All data is in 
    <a href="https://waterdata.usgs.gov/nwis/?tab_delimited_format_info" target="_blank">RDB</a> format.
</div>
<div>
    Data is retrieved from <a href="https://waterservices.usgs.gov"  target="_blank">USGS Water Data Services.</a>
</div>
<div>
 If you are an R user, use the 
 <a href="https://usgs-r.github.io/dataRetrieval/" target="_blank">USGS dataRetrieval package</a> to
 download, analyze and plot your data
</div>    
`;

/*
 * Helper function to return a ISO formated string in the location's time zone for the epoch time, inMillis
 */
const toISO = function(inMillis) {
    return DateTime.fromMillis(inMillis, {zone: config.locationTimeZone}).toISO();
};

/*
 * Helper functions to return the appropriate service URL using information in the Redux store
 */
const getIVDataURL =  function(store, siteno, timeRangeKind) {
    const currentState = store.getState();
    const timeRange = getTimeRange(timeRangeKind)(currentState);

    return getIVServiceURL({
        siteno,
        parameterCode: getPrimaryParameter(currentState).parameterCode,
        startTime: toISO(timeRange.start),
        endTime: toISO(timeRange.end),
        format: 'rdb'
    });
};
const getMedianDataURL = function(store, siteno) {
    return getStatisticsServiceURL({
        siteno,
        parameterCode: getPrimaryParameter(store.getState()).parameterCode,
        statType: 'median',
        format: 'rdb'
    });
};
const getGroundwaterLevelURL = function(store, siteno) {
    const currentState = store.getState();
    const timeRange = getTimeRange('current')(currentState);

    return getGroundwaterServiceURL({
        siteno,
        parameterCode: getPrimaryParameter(currentState).parameterCode,
        startTime: toISO(timeRange.start),
        endTime: toISO(timeRange.end),
        format: 'rdb'
    });
};
const getSiteMetaDataURL = function(siteno) {
    return getSiteMetaDataServiceURL({
        siteno,
        isExpanded: true
    });
};

/*
 * Helper function to render a single checkbox in container.
 */
const drawRadioButton = function(container, inputID, label, value) {
    const radioContainer = container.append('div')
        .attr('class', 'usa-radio');
    radioContainer.append('input')
        .attr('class', 'usa-radio__input')
        .attr('id', inputID)
        .attr('type', 'radio')
        .attr('name', 'retrieve-value')
        .attr('value', value);
    radioContainer.append('label')
        .attr('class', 'usa-radio__label')
        .attr('for', inputID)
        .text(label);
};

/*
 * Helper function to remove existing checkboxes and then render the checkboxes for the visible data.
 */
const drawRadioButtons = function(container, {
    hasVisiblePrimaryIVData,
    hasVisibleCompareIVData,
    hasVisibleMedianData,
    hasVisibleGroundwaterLevels
}) {
    container.select('.download-radio-container').remove();
    const radioContainer = container.append('div')
        .attr('class', 'download-radio-container');
    if (hasVisiblePrimaryIVData) {
        radioContainer.call(drawRadioButton, 'download-primary-iv-data', 'Current time-series data', 'primary');
    }
    if (hasVisibleCompareIVData) {
        radioContainer.call(drawRadioButton, 'download-compare-iv-data', 'Prior year time-series data', 'compare');
    }
    if (hasVisibleMedianData) {
        radioContainer.call(drawRadioButton, 'download-median-data', 'Median', 'median');
    }
    if (hasVisibleGroundwaterLevels) {
        radioContainer.call(drawRadioButton, 'download-field-visits', 'Field visits', 'groundwater-levels');
    }
    radioContainer.call(drawRadioButton, 'download-site-meta-data', 'About this location', 'site');
};

/*
 * Render the download form and set up all appropriate even handlers. The checkboxes drawn are tied to what data is currently
 * visible on the hydrograph.
 * @param {D3 selection} container
 * @param {Redux store} store
 * @param {String} siteno
 */
export const drawDownloadForm = function(container, store, siteno) {
    const downloadContainer = container.append('div');
    const formContainer = downloadContainer.append('div')
        .attr('class', 'usa-form')
        .append('fieldset')
            .attr('class', 'usa-fieldset');
    formContainer.append('legend')
        .attr('class', 'usa-legend')
        .text('Select data to be downloaded');
    formContainer.append('div')
        .attr('class', 'select-data-input-container')
        .call(link(store, drawRadioButtons, createStructuredSelector({
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
        .on('click', function(event) {
            event.stopPropagation();
            formContainer.selectAll('.alert-error-container').remove();
            const radioInput = formContainer.select('input[type="radio"]:checked');
            if (radioInput.size()) {
                let downloadUrl;
                let dataType = radioInput.attr('value');
                switch (dataType) {
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
                        console.log(`Unhandled value for downloading data: ${dataType}`);
                }
                if (downloadUrl) {
                    window.open(downloadUrl, '_blank');
                }

            } else {
                formContainer.insert('div', 'button')
                    .attr('class', 'alert-error-container')
                    .call(drawErrorAlert, {
                        body:'Please select one of the radio buttons',
                        useSlim: true
                    });
            }
        });
    downloadButton.append('i')
        .attr('class', 'fas fa-file-download')
        .attr('aria-hidden', true)
        .attr('role', 'img');
    downloadButton.append('span').text('Retrieve');

    downloadContainer.append('div')
        .attr('class', 'download-info')
        .html(INFO_TEXT);
};
