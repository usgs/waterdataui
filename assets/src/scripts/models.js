const { timeFormat, utcFormat } = require('d3-time-format');
const { get } = require('./ajax');
const { deltaDays } = require('./utils');


// Define Water Services root URL - use global variable if defined, otherwise
// use production.
const SERVICE_ROOT = window.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';
const PAST_SERVICE_ROOT = window.PAST_SERVICE_ROOT  || 'https://nwis.waterservices.usgs.gov/nwis';

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');
const isoFormatTime = utcFormat('%Y-%m-%dT%H:%MZ');

function olderThan120Days(date) {
    return date < new Date() - 120;
}

function tsServiceRoot(date) {
    return olderThan120Days(date) ? PAST_SERVICE_ROOT : SERVICE_ROOT;
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
        serviceRoot = SERVICE_ROOT;
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
                        const startDate = new Date(series.values[0].value[0].dateTime);
                        const endDate = new Date(
                            series.values[0].value.slice(-1)[0].dateTime);
                        const noDataValue = series.variable.noDataValue;
                        const qualifierMapping = series.values[0].qualifier.reduce((map, qualifier) => {
                            map[qualifier.qualifierCode] = qualifier.qualifierDescription;
                            return map;
                        }, {})
                        return {
                            code: series.variable.variableCode[0].value,
                            variableName: series.variable.variableName,
                            variableDescription: series.variable.variableDescription,
                            seriesStartDate: startDate,
                            seriesEndDate: endDate,
                            values: series.values[0].value.map(datum => {
                                let date = new Date(datum.dateTime);
                                let value = parseFloat(datum.value);
                                const qualifierDescriptions = datum.qualifiers.map((qualifier) => qualifierMapping[qualifier]);
                                if (value === noDataValue) {
                                    value = null;
                                }
                                return {
                                    time: date,
                                    value: value,
                                    qualifiers: datum.qualifiers,
                                    approved: datum.qualifiers.indexOf('A') > -1,
                                    estimated: datum.qualifiers.indexOf('E') > -1,
                                    label: `${formatTime(date)}\n${value} ${series.variable.unit.unitCode} (Qualifiers: (${qualifierDescriptions.join(', ')})`
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


export function getSiteStatistics({sites, statType, params=['00060']}) {
    let url = `${SERVICE_ROOT}/stat/?format=rdb&sites=${sites.join(',')}&statReportType=daily&statTypeCd=${statType}&parameterCd=${params.join(',')}`;
    return get(url);
}


/**
 * Function to parse RDB to Objects
 */
export function parseRDB(rdbData) {
    let rdbLines = rdbData.split('\n');
    let dataLines = rdbLines.filter(rdbLine => rdbLine[0] !== '#').filter(rdbLine => rdbLine.length > 0);
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
 * Determine if a given year is a leap year
 *
 * @param year
 * @returns {boolean}
 */
export function isLeapYear(year) {
    let leapYear = year % 4 === 0;
    if (year % 100 === 0) {
        if (year % 400 === 0) {
            leapYear = true;
        } else {
            leapYear = false;
        }
    }
    return leapYear;
}

/**
 *  Read median RDB data into something that makes sense
 *
 * @param medianData
 * @param timeSeriesStartDateTime
 * @param timeSeriesEndDateTime
 * @param timeSeriesUnit
 * @returns {object}
 */
export function parseMedianData(medianData, timeSeriesStartDateTime, timeSeriesEndDateTime, timeSeriesUnit) {
    let values = [];
    let sliceValues = [];
    let beginYear;
    let endYear;
    if (medianData.length > 0) {
        let firstRecord = medianData[0];
        beginYear = firstRecord.begin_yr;
        endYear = firstRecord.end_yr;
        let yearPresent = timeSeriesEndDateTime.getFullYear();
        let yearPrevious = yearPresent - 1;
        // calculate the number of days to display
        let days = deltaDays(timeSeriesStartDateTime, timeSeriesEndDateTime);
        for (let medianDatum of medianData) {
            let month = medianDatum.month_nu-1;
            let day = medianDatum.day_nu;
            let recordDate = new Date(yearPresent, month, day);
            if (!(new Date(yearPresent, 0, 1) <= recordDate && recordDate <= timeSeriesEndDateTime)) {
                recordDate = new Date(yearPrevious, month, day);
            }
            let median = {
                time: recordDate,
                value: parseFloat(medianDatum.p50_va),
                label: `${medianDatum.p50_va} ${timeSeriesUnit}`
            };
            // don't include leap days if it's not a leap year
            if (!isLeapYear(recordDate.getFullYear())) {
                if (!(month == 1 && day == 29)) {
                    values.push(median);
                }
            } else {
                values.push(median);
            }
        }
        //return array with times sorted in ascending order
        sliceValues = values.sort(function(a, b){
           return a.time - b.time;
        }).slice(values.length-days, values.length);
    }
    return {beginYear: beginYear, endYear: endYear, values: sliceValues};
}

export function getPreviousYearTimeseries({site, startTime, endTime}) {
    let lastYearStartTime = new Date(startTime.getTime());
    let lastYearEndTime = new Date(endTime.getTime());

    lastYearStartTime.setFullYear(startTime.getFullYear() - 1);
    lastYearEndTime.setFullYear(endTime.getFullYear() - 1);
    return getTimeseries({sites: [site], startDate: lastYearStartTime, endDate: lastYearEndTime});
}

export function getMedianStatistics({sites, params=['00060']}) {
    let medianRDB = getSiteStatistics({sites: sites, statType: 'median', params: params});
    return medianRDB.then((response) => {
        return parseRDB(response);
    }, (error) => {
        return error;
    });
}
