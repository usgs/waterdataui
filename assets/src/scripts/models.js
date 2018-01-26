const { timeFormat } = require('d3-time-format');
const { get } = require('./ajax.js');

// Define Water Services root URL - use global variable if defined, otherwise
// use production.
const SERVICE_ROOT = window.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');


/**
 * Get a given timeseries dataset from Water Services.
 * @param  {Array}    sites  Array of site IDs to retrieve.
 * @param  {Array}    params List of parameter codes
 * @param  {Function} callback       Callback to be called with (data, error)
 */
export function getTimeseries({sites, params=['00060']}) {
    let url = `${SERVICE_ROOT}/iv/?sites=${sites.join(',')}&parameterCd=${params.join(',')}&period=P7D&indent=on&siteStatus=all&format=json`;
    return get(url);
}

/**
 * Get statistics from some sites
 *
 * @param sites
 * @param params
 * @param statType
 */
export function getSiteStatistics({sites, params=['00060'], statType='median'}) {
    let url = `${SERVICE_ROOT}/stat/?format=rdb&sites=${sites.join(',')}&statReportType=daily&statTypeCd=${statType}&parameterCd=${params.join(',')}`;
    console.log(url);
    return get(url);
}


/**
 * Function to parse RDB to Objects
 */
export function parseRDB(rdbData) {
    let rdbLines = rdbData.split('\n');
    let dataLines = rdbLines.filter(rdbLine => rdbLine[0] != '#').filter(rdbLine => rdbLine.length > 0);
    // remove the useless row
    dataLines.splice(1, 1);
    let recordData = [];
    if (dataLines.length > 0) {
        let headers = dataLines.shift().split('\t');
        for (let dataLine of dataLines) {
            let data = dataLine.split('\t');
            let dataObject = {};
            for (let i=0; i < headers.length; i++) {
                dataObject[headers[i]] = data[i];
            }
            recordData.push(dataObject);
        }
    }
    return recordData;
}

/**
 *  Read median RDB data into something that makes sense
 *
 * @param medianData
 * @param timeSeries
 * @returns {Array}
 */
export function parseMedianData(medianData, timeSeries) {
    let data = [];
    if (medianData.length > 0 && timeSeries.length > 0) {
        let lastTsDate = timeSeries[timeSeries.length - 1].time;
        let yearPresent = lastTsDate.getFullYear();
        let lastTsDay = lastTsDate.getDate();
        let yearPrevious = yearPresent - 1;
        for(let medianDatum of medianData) {
            let month = medianDatum.month_nu-1;
            let day = medianDatum.day_nu;
            let recordDate = new Date(yearPresent, month, day);
            if (!(new Date(yearPresent, 0, 1) <= recordDate && recordDate <= lastTsDate)) {
                recordDate = new Date(yearPrevious, month, day);
            }
            let median = {
                time: recordDate,
                value: medianDatum.p50_va
            };
            data.push(median);
        }
    }
    //return array with times sorted in ascending order
    return data.sort(function(a, b) {
       return a.time - b.time;
    });
}


export function readTS(dataStr) {
    let data = JSON.parse(dataStr);
    return data.value.timeSeries.map(series => {
        let startDate = new Date(series.values[0].value[0].dateTime);
        let endDate = new Date(series.values[0].value.slice(-1)[0].dateTime);
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
                    label: `${formatTime(date)}\n${value.value} ${series.variable.unit.unitCode}`
                };
            })
        };
    });
}
