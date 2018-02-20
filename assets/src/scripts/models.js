const { timeFormat, utcFormat } = require('d3-time-format');
const { get } = require('./ajax');
const { deltaDays, replaceHtmlEntities } = require('./utils');


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
 * @param  {Array}    params Optional array of parameter codes
 * @param {Date} startDate
 * @param {Date} endData
 * @return {Promise} resolves to an array of timeseries model object, rejects to an error
 */
export function getTimeseries({sites, params=null, startDate=null, endDate=null}) {
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
    let paramCds = params !== null ? `&parameterCd=${params.join(',')}` : '';
    let url = `${serviceRoot}/iv/?sites=${sites.join(',')}${paramCds}&${timeParams}&indent=on&siteStatus=all&format=json`;
    return get(url)
        .then((response) => {
            let data = JSON.parse(response);
            return data.value.timeSeries.map(series => {
                let noDataValue = series.variable.noDataValue;
                const qualifierMapping = series.values[0].qualifier.reduce((map, qualifier) => {
                    map[qualifier.qualifierCode] = qualifier.qualifierDescription;
                    return map;
                }, {});
                return {
                    id: series.name,
                    code: series.variable.variableCode[0].value,
                    name: replaceHtmlEntities(series.variable.variableName),
                    type: series.variable.valueType,
                    unit: series.variable.unit.unitCode,
                    startTime: series.values[0].value.length ?
                        new Date(series.values[0].value[0].dateTime) : null,
                    endTime: series.values[0].value.length ?
                        new Date(series.values[0].value.slice(-1)[0].dateTime) : null,
                    description: series.variable.variableDescription,
                    values: series.values[0].value.map(datum => {
                        let date = new Date(datum.dateTime);
                        let value = parseFloat(datum.value);
                        if (value === noDataValue) {
                            value = null;
                        }
                        const qualifierDescriptions = datum.qualifiers.map((qualifier) => qualifierMapping[qualifier]);
                        return {
                            time: date,
                            value: value,
                            qualifiers: datum.qualifiers,
                            approved: datum.qualifiers.indexOf('A') > -1,
                            estimated: datum.qualifiers.indexOf('E') > -1,
                            label: `${formatTime(date)}\n${value || ''} ${value ? series.variable.unit.unitCode : ''} (${qualifierDescriptions.join(', ')})`
                        };
                    })
                };
            });
        })
        .catch(reason => {
            console.error(reason);
            return [];
        });
}


export function getSiteStatistics({sites, statType, params=null}) {
    let paramCds = params !== null ? `&parameterCd=${params.join(',')}` : '';
    let url = `${SERVICE_ROOT}/stat/?format=rdb&sites=${sites.join(',')}&statReportType=daily&statTypeCd=${statType}${paramCds}`;
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
 * Parse one median timeseries dataset.
 * @param medianData
 * @param timeSeriesStartDateTime
 * @param timeSeriesEndDateTime
 * @param timeSeriesUnit
 * @returns {object}
 */
export function parseMedianTimeseries(medianData, timeSeriesStartDateTime, timeSeriesEndDateTime, timeSeriesUnit) {
    let values = [];

    let yearPresent = timeSeriesEndDateTime.getFullYear();
    let yearPrevious = yearPresent - 1;

    // calculate the number of days to display
    let days = deltaDays(timeSeriesStartDateTime, timeSeriesEndDateTime);
    for (let medianDatum of medianData) {
        let month = medianDatum.month_nu - 1;
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

    return {
        id: medianData[0].ts_id,
        code: medianData[0].parameter_cd,
        name: medianData[0].loc_web_ds,
        type: 'Statistic',
        unit: timeSeriesUnit,
        startTime: timeSeriesStartDateTime,
        endTime: timeSeriesEndDateTime,
        description: medianData[0].loc_web_ds,
        medianMetadata: {
            beginYear: medianData[0].begin_yr,
            endYear: medianData[0].end_yr
        },
        values: values.sort(function(a, b){
           return a.time - b.time;
        }).slice(values.length - days, values.length)
    };
}

/**
 * Read median RDB data into something that makes sense.
 * @param medianData
 * @param timeSeriesStartDateTime
 * @param timeSeriesEndDateTime
 * @param timeSeriesUnit
 * @returns {object}
 */
export function parseMedianData(medianData, timeSeriesStartDateTime, timeSeriesEndDateTime, timeSeriesUnits) {

    // Organize median data by parameter code and timeseries id
    const dataByTimseriesID = medianData.reduce(function (byTimseriesID, d) {
        byTimseriesID[d.parameter_cd] = byTimseriesID[d.parameter_cd] || {};
        byTimseriesID[d.parameter_cd][d.ts_id] = byTimseriesID[d.parameter_cd][d.ts_id] || [];
        byTimseriesID[d.parameter_cd][d.ts_id].push(d);
        return byTimseriesID;
    }, {});

    const timeseries = {};
    for (let parameterCd of Object.keys(dataByTimseriesID)) {
        timeseries[parameterCd] = {};
        for (let timeseriesId of Object.keys(dataByTimseriesID[parameterCd])) {
            const rows = dataByTimseriesID[parameterCd][timeseriesId];
            const parsed = parseMedianTimeseries(rows, timeSeriesStartDateTime, timeSeriesEndDateTime, timeSeriesUnits[parameterCd]);
            timeseries[parameterCd][timeseriesId] = parsed;
        }
    }

    // FIXME: For a quick hack, only show the first set of median data per parameter code.
    return Object.keys(timeseries).reduce(function (acc, parmCd) {
        const firstTs = Object.keys(timeseries[parmCd])[0];
        acc[parmCd] = timeseries[parmCd][firstTs];
        return acc;
    }, {});
}

export function getPreviousYearTimeseries({site, startTime, endTime}) {
    let lastYearStartTime = new Date(startTime.getTime());
    let lastYearEndTime = new Date(endTime.getTime());

    lastYearStartTime.setFullYear(startTime.getFullYear() - 1);
    lastYearEndTime.setFullYear(endTime.getFullYear() - 1);
    return getTimeseries({sites: [site], startDate: lastYearStartTime, endDate: lastYearEndTime});
}

export function getMedianStatistics({sites, params=null}) {
    let medianRDB = getSiteStatistics({sites: sites, statType: 'median', params: params});
    return medianRDB.then((response) => {
        return parseRDB(response);
    }, (error) => {
        return error;
    });
}
