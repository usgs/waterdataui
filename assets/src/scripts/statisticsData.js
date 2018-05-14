const { get } = require('./ajax');
const config = require('./config');
const { parseRDB } = require('./utils');



const SERVICE_ROOT = config.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';

/*
 * @ returns {Promise} with response string if successful or rejected with error status
 */
export const fetchSitesStatisticsRDB = function({sites, statType, params=null}) {
    let paramCds = params !== null ? `&parameterCd=${params.join(',')}` : '';
    let url = `${SERVICE_ROOT}/stat/?format=rdb&sites=${sites.join(',')}&statReportType=daily&statTypeCd=${statType}${paramCds}`;
    return get(url);
};

/*
 * @returns {Promise}. If resolved, {Object} is returned. If rejected, the error status is passed
 */
export const fetchSiteMedianStatistics = function({site, params=null}) {
    let medianRDB = fetchSitesStatisticsRDB({sites: [site], statType: 'median', params: params});
    return medianRDB.then((response) => {
        const statsData = parseRDB(response);
        return statsData.reduce((finalResult, dataLine) => {
            finalResult[dataLine.parameter_cd] = finalResult[dataLine.parameter_cd] || [];
            finalResult[dataLine.parameter_cd].push(dataLine);
            return finalResult;
        }, {});
    }, (error) => {
        return error;
    });
};