import {get} from 'ui/ajax';
import config from 'ui/config';
import {parseRDB} from 'ui/utils';


/**
 * Formats a URL for the purpose of downloading median statistics in RDB format
 * @param  {String}  siteno - A code that uniquely identifies a monitoring location
 * @param  {String}  parameterCode - USGS five digit parameter code
 * @param {String} statType - The statistics type requested from the water services API, such as 'median'
 * @param {String} format - The format of the data returned from the water services API, such as 'json' or 'rdb'
 * @return {String} The URL used to contact waterservices.usgs.gov
 */
export const getStatisticsServiceURL = function({siteno, parameterCode, statType, format}) {
    return `${config.STATISTICS_ENDPOINT}/?sites=${siteno}&statReportType=daily&statTypeCd=${statType}&parameterCd=${parameterCode}&format=${format}`;
};

/*
 * Fetches statistics information in the RDB format for the statType. If params is not specified all parameters for the
 * sites are fetched.
 * @param {String} siteno
 * @param {String} statType
 * @param {String} parameterCode
 * @returns {Promise} with response string if successful or rejected with error status
 */
export const fetchSitesStatisticsRDB = function({siteno, statType, parameterCode}) {
    return get(getStatisticsServiceURL({
        siteno: siteno,
        parameterCode: parameterCode,
        statType: statType,
        format: 'rdb'
    }));
};

/*
 * Fetches the median statistics for the site and the parameters. If params is null all parameters are fetched.
 * @param {String} site
 * @param {String} statType
 * @param {String} parameterCode
 * @returns {Promise}. If resolved, {Object} is returned. If rejected, the error status is passed
 */
export const fetchSiteStatistics = function({siteno, statType, parameterCode=null}) {
    let medianRDB = fetchSitesStatisticsRDB({siteno, statType, parameterCode});
    return medianRDB.then((response) => {
        const statsData = parseRDB(response);
        return statsData.reduce((finalResult, dataLine) => {
            finalResult[dataLine.parameter_cd] = finalResult[dataLine.parameter_cd] || {};
            finalResult[dataLine.parameter_cd][dataLine.ts_id] =
                finalResult[dataLine.parameter_cd][dataLine.ts_id]|| [];
            finalResult[dataLine.parameter_cd][dataLine.ts_id].push(dataLine);
            return finalResult;
        }, {});
    }, () => {
        return {};
    });
};
