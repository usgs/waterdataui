import {utcFormat} from 'd3-time-format';

import {DateTime} from 'luxon';

import {get} from 'ui/ajax';
import config from 'ui/config';

export const isoFormatTime = utcFormat('%Y-%m-%dT%H:%MZ');


function olderThan120Days(date) {
    return date < new Date() - 120;
}

function tsServiceRoot(date) {
    return olderThan120Days(date) ? config.PAST_SERVICE_ROOT : config.SERVICE_ROOT;
}

function getNumberOfDays(period) {
    const days = period.match(/\d+/);
    if (days.length === 1) {
        return parseInt(days[0]);
    } else {
        return null;
    }
}

/**
 * Get a given time series dataset from Water Services.
 * @param  {Array}    sites  Array of site IDs to retrieve.
 * @param  {Array}    params Optional array of parameter codes
 * @param {Date} startDate
 * @param {Date} endData
 * @param {String} period
 * @return {Promise} resolves to an array of time series model object, rejects to an error
 */
export const getTimeSeries = function({sites, params=null, startDate=null, endDate=null, period=null}) {
    let timeParams;
    let serviceRoot;

    if (!startDate && !endDate) {
        const timePeriod = period || 'P7D';
        const dayCount = getNumberOfDays(timePeriod);
        timeParams = `period=${timePeriod}`;
        serviceRoot = dayCount && dayCount < 120 ? config.SERVICE_ROOT : config.PAST_SERVICE_ROOT;
    } else {
        let startString = startDate ? isoFormatTime(startDate) : '';
        let endString = endDate ? isoFormatTime(endDate) : '';
        timeParams = `startDT=${startString}&endDT=${endString}`;
        serviceRoot = tsServiceRoot(startDate);
    }

    // Normal parameter codes have five numerical digits. If the parameter code has an alphabetical letter
    // as a suffix, such as 00010F, it means that parameter has been altered in our application.
    // Parameter codes with such a suffix are for use in our application only, so we need to remove
    // any suffix before using the parameter code in a web call to a NWIS system.
    if (params) {
        params = params.map(function(param) {
            return param.replace(`${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`, '');
        });
    }

    let paramCds = params !== null ? `&parameterCd=${params.join(',')}` : '';
    let url = `${serviceRoot}/iv/?sites=${sites.join(',')}${paramCds}&${timeParams}&siteStatus=all&format=json`;

    return get(url)
        .then(response => JSON.parse(response))
        .catch(reason => {
            console.error(reason);
            throw reason;
        });
};

export const getPreviousYearTimeSeries = function({site, startTime, endTime, parameterCode}) {
    const hoursInOneYear = 8760;
    parameterCode = parameterCode ? [parameterCode] : null;
    const lastYearStartTime = DateTime.fromMillis(startTime).minus({hours: hoursInOneYear});
    const lastYearEndTime = DateTime.fromMillis(endTime).minus({hours: hoursInOneYear});

    return getTimeSeries({sites: [site], startDate: lastYearStartTime, endDate: lastYearEndTime, params: parameterCode});
};

export const queryWeatherService = function(latitude, longitude) {
    const url = `${config.WEATHER_SERVICE_ROOT}/points/${latitude},${longitude}`;
    return get(url)
        .then(response => JSON.parse(response))
        .catch(reason => {
            console.error(reason);
            return {properties: {}};
        });
};
