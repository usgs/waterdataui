import { utcFormat } from 'd3-time-format';
import config from './config';
import { get } from './ajax';


// Define Water Services root URL - use global variable if defined, otherwise
// use production.
const SERVICE_ROOT = config.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';
const PAST_SERVICE_ROOT = config.PAST_SERVICE_ROOT  || 'https://nwis.waterservices.usgs.gov/nwis';
const WEATHER_SERVICE_ROOT = config.WEATHER_SERVICE_ROOT || 'https://api.weather.gov';

export const isoFormatTime = utcFormat('%Y-%m-%dT%H:%MZ');

const PARAM_PERTINENCE = {
    '00060': 0,
    '00065': 1,
    '72019': 2
};

function olderThan120Days(date) {
    return date < new Date() - 120;
}

function tsServiceRoot(date) {
    return olderThan120Days(date) ? PAST_SERVICE_ROOT : SERVICE_ROOT;
}

/**
 * Get a given time series dataset from Water Services.
 * @param  {Array}    sites  Array of site IDs to retrieve.
 * @param  {Array}    params Optional array of parameter codes
 * @param {Date} startDate
 * @param {Date} endData
 * @return {Promise} resolves to an array of time series model object, rejects to an error
 */
export const getTimeSeries = function ({sites, params=null, startDate=null, endDate=null}) {
    let timeParams;
    let serviceRoot;
    if (!startDate && !endDate) {
        timeParams = 'period=P7D';
        serviceRoot = SERVICE_ROOT;
    } else {
        let dateParams = [];
        if (startDate !== null) {
            const startString = startDate ? isoFormatTime(startDate) : '';
            dateParams.push(`startDT=${startString}`);
        }
        if (endDate !== null) {
            const endString = endDate ? isoFormatTime(endDate) : '';
            dateParams.push(`endDT=${endString}`);
        }
        // let startString = startDate ? isoFormatTime(startDate) : '';
        // let endString = endDate ? isoFormatTime(endDate) : '';
        // timeParams = `startDT=${startString}&endDT=${endString}`;
        timeParams = dateParams !== null ? dateParams.join('&') : '';
        serviceRoot = tsServiceRoot(startDate);
    }
    let paramCds = params !== null ? `&parameterCd=${params.join(',')}` : '';

    let url = `${serviceRoot}/iv/?sites=${sites.join(',')}${paramCds}&${timeParams}&siteStatus=all&format=json`;
    console.log(url);
    return get(url)
        .then(response => JSON.parse(response))
        .catch(reason => {
            console.error(reason);
            throw reason;
        });
};

export const getPreviousYearTimeSeries = function ({site, startTime, endTime}) {
    let lastYearStartTime = new Date(startTime);
    let lastYearEndTime = new Date(endTime);

    lastYearStartTime.setFullYear(lastYearStartTime.getFullYear() - 1);
    lastYearEndTime.setFullYear(lastYearEndTime.getFullYear() - 1);
    return getTimeSeries({sites: [site], startDate: lastYearStartTime, endDate: lastYearEndTime});
};

export const sortedParameters = function (variables) {
    const dataVars = variables ? Object.values(variables) : [];
    const pertinentParmCds = Object.keys(PARAM_PERTINENCE);
    const highPertinenceVars = dataVars.filter(x => pertinentParmCds.includes(x.variableCode.value))
        .sort((a, b) => {
            const aPertinence = PARAM_PERTINENCE[a.variableCode.value];
            const bPertinence = PARAM_PERTINENCE[b.variableCode.value];
            if (aPertinence < bPertinence) {
                return -1;
            } else {
                return 1;
            }
        });
    const lowPertinenceVars = dataVars.filter(x => !pertinentParmCds.includes(x.variableCode.value))
        .sort((a, b) => {
            const aDesc = a.variableDescription.toLowerCase();
            const bDesc = b.variableDescription.toLowerCase();
            if (aDesc < bDesc) {
                return -1;
            } else {
                return 1;
            }
        });
    return highPertinenceVars.concat(lowPertinenceVars);
};

export const queryWeatherService = function (latitude, longitude) {
    const url = `${WEATHER_SERVICE_ROOT}/points/${latitude},${longitude}`;
    return get(url)
        .then(response => JSON.parse(response))
        .catch(reason => {
            console.error(reason);
            return {properties: {}};
        });
};
