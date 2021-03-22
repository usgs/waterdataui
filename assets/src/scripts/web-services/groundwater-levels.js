
import {get} from 'ui/ajax';
import config from 'ui/config';


/**
 *  Formats a URL for the purpose of downloading groundwater levels data in RDB format
 * @param  {String}  siteno - A code that uniquely identifies a monitoring location
 * @param  {String}  parameterCode - USGS five digit parameter code
 * @param {String} startTime - ISO 8601 time
 * @param {String} endTime- ISO 8601 time
 * @param {String} format - The format of the data returned from the water services API, such as 'json' or 'rdb'
 * @return {String} The URL used to contact waterservices.usgs.gov
 */
export const getGroundwaterServiceURL = function({siteno, parameterCode, period=null, startTime=null, endTime=null, format}) {
    const parameterCodeQuery = parameterCode ? `&parameterCd=${parameterCode}` : '';
    let timeQuery;
    if (period) {
        timeQuery = `&period=${period}`;
    } else {
        timeQuery = startTime && endTime ? `&startDT=${startTime}&endDT=${endTime}` : '';
    }
    return `${config.GROUNDWATER_LEVELS_ENDPOINT}?sites=${siteno}${parameterCodeQuery}${timeQuery}&format=${format}`;
};

/**
 * Fetch the groundwater levels for site, parameterCode, and period
 * @param {String} sites
 * @param {String} parameterCode
 * @param {String} startTime - ISO-8601 time format
 * @param {String} endTime - ISO-8601 time format
 * @return {Promise} resolves to Object that is retrieved with ground water levels
 */
export const fetchGroundwaterLevels = function({siteno, parameterCode=null, period=null, startTime=null, endTime=null}) {
    return get(getGroundwaterServiceURL(
        {
            siteno: siteno,
            parameterCode: parameterCode,
            period: period,
            startTime: startTime,
            endTime: endTime,
            format: 'json'
        })).then(response => JSON.parse(response))
        .catch(reason => {
            console.error(reason);
            return {};
        });
};