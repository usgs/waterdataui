const { set } = require('d3-collection');
const { utcFormat } = require('d3-time-format');

const { get } = require('./ajax');
const { deltaDays } = require('./utils');


// Define Water Services root URL - use global variable if defined, otherwise
// use production.
const SERVICE_ROOT = window.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';
const PAST_SERVICE_ROOT = window.PAST_SERVICE_ROOT  || 'https://nwis.waterservices.usgs.gov/nwis';

export const PARAM_PERTINENCE = {
    '00060': {'rank': 0},
    '00065': {'rank': 1},
    '72019': {'rank': 2}
};


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
        .then(response => JSON.parse(response))
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
 * @param varsByCode
 * @returns {object}
 */
export function mergeMedianTimeseries(collection, medianData, timeSeriesStartDateTime, timeSeriesEndDateTime, varsByCode) {
    // We only have data for the variables returned from the IV service. If this
    // series doesn't correspond with an IV series, skip it.
    const variable = varsByCode[medianData[0].parameter_cd];
    if (!variable) {
        console.info(`(Median statistics) Variable data not available for ${medianData[0].parameter_cd} - skipping`);
        return collection;
    }

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
            dateTime: recordDate,
            value: parseFloat(medianDatum.p50_va)
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

    const tsId = `${medianData[0].parameter_cd}:${medianData[0].ts_id}:median`;
    const tsCollectionId = `${medianData[0].site_no}:${medianData[0].parameter_cd}:median`;

    let collectionSet;
    if (collection.requests && collection.requests.median &&
            collection.requests.median.timeSeriesCollections) {
        collectionSet = set(collection.requests.median.timeSeriesCollections);
    } else {
        collectionSet = set();
    }
    collectionSet.add(tsCollectionId);

    // Normalize the median data into a structure comparable to how the
    // IV service data is normalized.
    return {
        ...collection,
        timeSeries: {
            ...collection.timeSeries || {},
            [tsId]: {
                points: values.sort(function (a, b) {
                    return a.dateTime - b.dateTime;
                }).slice(values.length - days, values.length),
                startTime: timeSeriesStartDateTime,
                endTime: timeSeriesEndDateTime,
                tsKey: 'median',
                method: tsId,
                variable: varsByCode[medianData[0].parameter_cd].oid,
                metadata: {
                    beginYear: medianData[0].begin_yr,
                    endYear: medianData[0].end_yr
                }
            }
        },
        timeSeriesCollections: {
            ...collection.timeSeriesCollections || {},
            [tsCollectionId]: {
                sourceInfo: medianData[0].site_no,
                variable: varsByCode[medianData[0].parameter_cd].oid,
                name: tsCollectionId,
                timeSeries: [
                    ...((collection.timeSeriesCollections || {})[tsCollectionId] || []).timeSeries || [],
                    tsId
                ]
            }
        },
        methods: {
            ...collection.methods || {},
            [tsId]: {
                methodDescription: medianData[0].loc_web_ds,
                methodID: tsId
            }
        },
        requests: {
            ...collection.requests || {},
            median: {
                timeSeriesCollections: collectionSet ? collectionSet.values() : []
            }
        }
    };
}

/**
 * Read median RDB data into something that makes sense.
 * @param medianData
 * @param timeSeriesStartDateTime
 * @param timeSeriesEndDateTime
 * @param timeSeriesUnits
 * @returns {object}
 */
export function parseMedianData(medianData, timeSeriesStartDateTime, timeSeriesEndDateTime, variables) {

    // Organize median data by parameter code and timeseries id
    const dataByTimeseriesID = medianData.reduce(function (byTimeseriesID, d) {
        byTimeseriesID[d.ts_id] = byTimeseriesID[d.ts_id] || [];
        byTimeseriesID[d.ts_id].push(d);
        return byTimeseriesID;
    }, {});

    const varsByCode = Object.keys(variables).reduce((vars, varId) => {
        const variable = variables[varId];
        vars[variable.variableCode.value] = variable;
        return vars;
    }, {});

    let collection = {};
    for (let tsID of Object.keys(dataByTimeseriesID)) {
        const rows = dataByTimeseriesID[tsID];
        collection = mergeMedianTimeseries(
            collection, rows, timeSeriesStartDateTime, timeSeriesEndDateTime, varsByCode);
    }

    return collection;
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


export function sortedParameters(variables) {
    const dataVars = variables ? Object.values(variables) : [];
    const pertinentParmCds = Object.keys(PARAM_PERTINENCE);
    const highPertinenceVars = dataVars.filter(x => pertinentParmCds.includes(x.variableCode.value))
        .sort((a, b) => {
            const aRank = PARAM_PERTINENCE[a.variableCode.value].rank;
            const bRank = PARAM_PERTINENCE[b.variableCode.value].rank;
            if (aRank < bRank) {
                return -1;
            } else {
                return 0;
            }
        });
    const lowPertinenceVars = dataVars.filter(x => !pertinentParmCds.includes(x.variableCode.value))
        .sort((a, b) => {
            const aDesc = a.variableDescription;
            const bDesc = b.variableDescription;
            if (aDesc < bDesc) {
                return -1;
            } else {
                return 0;
            }
        });
    return highPertinenceVars.concat(lowPertinenceVars);
}