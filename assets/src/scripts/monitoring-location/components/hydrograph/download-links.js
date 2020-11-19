/**
 *  Module with functions for processing and structuring download link URLs
 */

import config from 'ui/config.js';

/*
 * Uses information from the state to structure a URL that will work with WaterServices
 * @param {String} currentIVDateRange
 * @param {Object} queryInformation - from the application state under ivTimeSeriesData>queryInfo; contains
 * URL queries for WaterServices - but they require reformatting to use
 * @param {String} parameterCode - a five digit number indicating the type of data
 * @param {String} timeSeriesType - one of two options, 'current' or 'compare'
 * @return {String} a URL usable to retrieve station data from WaterServices
 */
export const createHrefForDownloadLinks = function(currentIVDateRange, queryInformation, parameterCode, timeSeriesType) {
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

    return url;
};

