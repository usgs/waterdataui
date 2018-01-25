const { timeFormat, utcFormat } = require('d3-time-format');
const { get } = require('./ajax');


// Define Water Services root URL - use global variable if defined, otherwise
// use production.
const CURRENT_DATA_SERVICE_ROOT = window.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');
const isoFormatTime = utcFormat('%Y-%m-%dT%H:%MZ');

function olderThan120Days(date) {
    return date < new Date() - 120;
}

function tsServiceRoot(date) {
    return olderThan120Days(date) ? 'https://nwis.waterservices.usgs.gov/nwis' : CURRENT_DATA_SERVICE_ROOT;
}

/**
 * Get a given timeseries dataset from Water Services.
 * @param  {Array}    sites  Array of site IDs to retrieve.
 * @param  {Array}    params List of parameter codes
 * @param {Date} startDate
 * @param {Date} endData
 * @return {Promise} resolves to an array of timeseries model object, rejects to an error
 */
export function getTimeseries({sites, params=['00060'], startDate=null, endDate=null}) {
    let timeParams;
    let serviceRoot;
    if (!startDate && !endDate) {
        timeParams = 'period=P7D';
        serviceRoot = CURRENT_DATA_SERVICE_ROOT;
    } else {
        let startString = startDate ? isoFormatTime(startDate) : '';
        let endString = endDate ? isoFormatTime(endDate) : '';
        timeParams = `startDT=${startString}&endDT=${endString}`;
        serviceRoot = tsServiceRoot(startDate);
    }
    let url = `${serviceRoot}/iv/?sites=${sites.join(',')}&parameterCd=${params.join(',')}&${timeParams}&indent=on&siteStatus=all&format=json`;
    return get(url)
        .then((response) => {
            let data = JSON.parse(response);
            return data.value.timeSeries.map(series => {
                    let startDate = new Date(series.values[0].value[0].dateTime);
                    let endDate = new Date(
                        series.values[0].value.slice(-1)[0].dateTime);
                    return {
                        code: series.variable.variableCode[0].value,
                        variableName: series.variable.variableName,
                        variableDescription: series.variable.variableDescription,
                        seriesStartDate: startDate,
                        seriesEndDate: endDate,
                        values: series.values[0].value.map(value => {
                            let date = new Date(value.dateTime);
                            return {
                                time: date,
                                value: parseFloat(value.value),
                                label: `${formatTime(
                                    date)}\n${value.value} ${series.variable.unit.unitCode}`
                            };
                        })
                    };
                }
            );
        },
        (error) => {
            return error;
        });
}

export function getPreviousYearTimeseries({site, startTime, endTime}) {
    let lastYearStartTime = new Date(startTime.getTime());
    let lastYearEndTime = new Date(endTime.getTime());

    lastYearStartTime.setFullYear(startTime.getFullYear() - 1);
    lastYearEndTime.setFullYear(endTime.getFullYear() - 1);

    return getTimeseries({sites: [site], startDate: lastYearStartTime, endDate: lastYearEndTime});
}
