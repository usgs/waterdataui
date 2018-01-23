const { timeFormat, utcFormat } = require('d3-time-format');
const { get } = require('./ajax');


// Define Water Services root URL - use global variable if defined, otherwise
// use production.
const SERVICE_ROOT = window.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');
const isoFormatTime = utcFormat('%Y-%m-%dT%H:%M')

/**
 * Get a given timeseries dataset from Water Services.
 * @param  {Array}    sites  Array of site IDs to retrieve.
 * @param  {Array}    params List of parameter codes
 * @return {Promise} resolves to an array of timeseries model object, rejects to an error
 */
export function getTimeseries({sites, params=['00060'], startDate=null, endDate=null}) {
    let timeParams;
    if (!startDate && !endDate) {
        timeParams = 'period=P7D';
    }
    else {
        let startString = startDate ? isoFormatTime(startDate) : '';
        let endString = endDate ? isoFormatTime(endDate) : '';
        timeParams = `startDT=${startString}&endDT=${endString}`;
    }
    let url = `${SERVICE_ROOT}/iv/?sites=${sites.join(',')}&parameterCd=${params.join(',')}&${timeParams}&indent=on&siteStatus=all&format=json`;
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
