/**
 *  Module with functions for processing and structuring download link URLs
 */
import {DateTime} from 'luxon';

import config from 'ui/config.js';

/*
* Converts a numerical time representation to a calendar date format
* @param {Object} customTimeRange - A numerical time indicator than can be converted to date format
* @param {String} ianaTimeZone - A geographical reference to the user's timezone
* @return {Object} Contains the start and end calendar dates
*/
export const convertTimeToDate = function(customTimeRange, ianaTimeZone) {
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
* @ return {String} a URL formatted to return data from WaterServices that matches the currently displayed hydrograph
*/
export const createStationDataDownloadURLForWaterServices = function(currentIVDateRange, customTimeRange, ianaTimeZone, parameterCode, siteno) {
    if (currentIVDateRange === 'custom') {
        const convertedTimeDate = convertTimeToDate(customTimeRange, ianaTimeZone);

        return `${config.WATER_SERVICES_IV}/?format=rdb&sites=${siteno}&startDT=${convertedTimeDate.start}&endDT=${convertedTimeDate.end}&parameterCd=${parameterCode}&siteStatus=all`;
    } else {

        return `${config.WATER_SERVICES_IV}/?format=rdb&sites=${siteno}&period=${currentIVDateRange}&parameterCd=${parameterCode}&siteStatus=all`;
    }
};

/*
 * Uses information from the state to structure a URL that will work with WaterServices
 * @param {String} currentIVDateRange
 * @param {Object} queryInformation - from the application state under ivTimeSeriesData>queryInfo; contains
 * URL queries for WaterServices - but they require reformatting to use
 * @return {String} a URL usable to retrieve station data from WaterServices
 */
export const createHrefForDownloadOfCompareData = function(currentIVDateRange, queryInformation, parameterCode) {
    let compareObjectKey;
    if (currentIVDateRange === 'P7D') {
        compareObjectKey = `compare:${currentIVDateRange}`;
    } else {
        compareObjectKey = `compare:${currentIVDateRange}:00060`;
    }

    const urlObjectFromState = queryInformation[compareObjectKey];

    let url = '';
    if (urlObjectFromState) {
        url = urlObjectFromState.queryURL;
        const splitUrl = url.split('http://nwis.waterservices.usgs.gov/nwis/iv/');
        url = splitUrl[1];
        url = url.replace('json', 'rdb');
        url = `${config.WATER_SERVICES_IV}/?${url}&parameterCd=${parameterCode}`;
    }

    return url;
};
