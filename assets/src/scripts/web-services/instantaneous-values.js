
import {DateTime} from 'luxon';

import {get} from 'ui/ajax';
import config from 'ui/config';

/*
 * Return the past service root if the start dt is more than 120 days from now
 */
function tsServiceRoot(dateTime) {
    return DateTime.local().diff(dateTime).as('days') > 120 ? config.PAST_SERVICE_ROOT : config.SERVICE_ROOT;
}

function getNumberOfDays(period) {
    const days = period.match(/\d+/);
    if (days.length === 1) {
        return parseInt(days[0]);
    } else {
        return null;
    }
}

/*
* Get a URL formatted to download data from waterservices.usgs.gov
* @param  {Array}  sites  Array of site IDs to retrieve.
* @param  {String}  parameterCodes
* @param {String} period - ISO 8601 Duration
* @param {String} startTime - ISO 8601 time
* @param {String} endTime - ISO 8601 time
* @param {String} format - the data format returned from waterservices.usgs.gov
* @return {String} The URL used to contact waterservices.usgs.gov
 */
export const getServiceURL = function({monitoringLocations, parameterCode= null, period=null, startTime=null, endTime=null, format=null}) {
    let timeParams;
    let serviceRoot;

    if (period) {
        const timePeriod = period;
        const dayCount = getNumberOfDays(timePeriod);
        timeParams = `period=${timePeriod}`;
        serviceRoot = dayCount && dayCount < 120 ? config.SERVICE_ROOT : config.PAST_SERVICE_ROOT;
    } else if (startTime && endTime) {
        const startDateTime =  DateTime.fromISO(startTime);
        timeParams = `startDT=${startTime}&endDT=${endTime}`;
        serviceRoot = tsServiceRoot(startDateTime);
    } else {
        timeParams = '';
        serviceRoot = config.SERVICE_ROOT;
    }

    let parameterCodeQuery = parameterCode ? `&parameterCd=${parameterCode}` : '';

    return  `${serviceRoot}/iv/?sites=${monitoringLocations.join(',')}${parameterCodeQuery}&${timeParams}&siteStatus=all&format=${format}`;
};

/**
 * Get a given time series dataset from Water Services.
 * @param  {Array}  sites  Array of site IDs to retrieve.
 * @param  {String}  parameterCodes
 * @param {String} period - ISO 8601 Duration
 * @param {String} startTime - ISO 8601 time
 * @param {String} endTime - ISO 8601 time
 * @return {Promise} resolves to an array of time series model object, rejects to an error
 */
export const fetchTimeSeries = function({sites, parameterCode= null, period=null, startTime=null, endTime=null}) {
    return get(getServiceURL({
            monitoringLocations: sites,
            parameterCode: parameterCode,
            period:  period,
            startTime: startTime,
            endTime: endTime,
            format: 'json'
        })).then(response => JSON.parse(response))
        .catch(reason => {
            console.error(reason);
            throw reason;
        });
};
