const { timeFormat } = require('d3-time-format');


// Define Water Services root URL - use global variable if defined, otherwise
// use production.
const SERVICE_ROOT = window.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');


/**
 * Simple XMLHttpRequest wrapper.
 * @param  {String}   url      URL to retrieve
 * @param  {Function} callback Callback function to call with (data, error)
 */
function get(url, callback) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            let data;
            try {
                data = JSON.parse(xmlhttp.responseText);
            } catch(err) {
                callback(null, err.message);
            }
            callback(data);
        }
    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}


/**
 * Get a given timeseries dataset from Water Services.
 * @param  {Array}    sites  Array of site IDs to retrieve.
 * @param  {Array}    params List of parameter codes
 * @param  {Function} callback       Callback to be called with (data, error)
 */
export function getTimeseries({sites, params=['00060']}, callback) {
    let url = `${SERVICE_ROOT}/iv/?sites=${sites.join(',')}&parameterCd=${params.join(',')}&period=P7D&indent=on&siteStatus=all&format=json`;
    get(url, (data, error) => {
        if (error) {
            callback(null, error || 'Unexpected error');
        }
        callback(data.value.timeSeries.map(series => {
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
        }));
    });
}


/**
 * Function to parse RDB to Objects
 */
export function parseRDB(rdbData) {
    let rdbLines = rdbData.split('\n');
    var dataLines = rdbLines.filter(rdbLine => rdbLine[0] != '#').filter(rdbLine => rdbLine.length > 0);
    // remove the useless column
    dataLines.splice(1, 1);
    var recordData = [];
    if (dataLines.length > 0) {
        let headers = dataLines.shift().split('\t');
        for (let dataLine of dataLines) {
            let data = dataLine.split('\t');
            let dataObject = {};
            for (var i=0; i < headers.length; i++) {
                dataObject[headers[i]] = data[i];
            }
            recordData.push(dataObject);
        }
    }
    return recordData;
}

/*
 * Read median RDB data into something that makes sense
 */
export function parseMedianData(medianData) {
    let data = [];
    let currentYear = new Date().getFullYear();
    for(let medianDatum of medianData) {
        let median = new Object();
        let month = medianDatum.month_nu-1;
        let day = medianDatum.day_nu;
        let recordDate = new Date(2018, month, day);
        median.time = recordDate;
        median.value = medianDatum.p50_va;;
        data.push(median);
    }
    return data;
}

