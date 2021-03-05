
import {get} from 'ui/ajax';
import config from 'ui/config';


/**
 *  Formats a URL for the purpose of downloading groundwater levels data in RDB format
 * @param  {String}  siteno - A code that uniquely identifies a monitoring location
 * @param  {String}  parameterCode - USGS five digit parameter code
 * @param {String} startTimeDT - ISO 8601 time
 * @param {String} endDT- ISO 8601 time
 * @param {String} format - The format of the data returned from the water services API, such as 'json' or 'rdb'
 * @return {String} The URL used to contact waterservices.usgs.gov
 */
export const getServiceURLSGroundwater = function({siteno, parameterCode, period= null, startDT=null, endDT=null, format}) {
    const parameterCodeQuery = parameterCode ? `&parameterCd=${parameterCode}` : '';
    let timeQuery;
    if (period) {
        timeQuery = `&period=${period}`;
    } else {
        timeQuery = startDT && endDT ? `&startDT=${startDT}&endDT=${endDT}` : '';
    }
    return `${config.GROUNDWATER_LEVELS_ENDPOINT}?sites=${siteno}${parameterCodeQuery}${timeQuery}&format=${format}`;
};

/**
 * Fetch the groundwater levels for site, parameterCode, and period
 * @param {String} sites
 * @param {String} parameterCode
 * @param {String} startDT - ISO-8601 date format
 * @param {String} endDT - ISO-8601 date format
 * @return {Promise} resolves to Object that is retrieved with ground water levels
 */
export const fetchGroundwaterLevels = function({site, parameterCode=null, period= null, startDT=null, endDT=null}) {
    return get(getServiceURLSGroundwater(
        {
            siteno: site,
            parameterCode: parameterCode,
            period: period,
            startDT: startDT,
            endDT: endDT,
            format: 'json'
        })).then(response => JSON.parse(response))
        .catch(reason => {
            console.error(reason);
            return {};
        });
};