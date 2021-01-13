
import {get} from 'ui/ajax';
import config from 'ui/config';

/**
 * Fetch the groundwater levels for site, parameterCode, and period
 * @param {String} sites
 * @param {String} parameterCode
 * @param {String} startDT - ISO-8601 date format
 * @param {String} endDT - ISO-8601 date format
 * @return {Promise} resolves to Object that is retrieved with ground water levels
 */
export const fetchGroundwaterLevels = function({site, parameterCode, startDT, endDT}) {
    const queryParams = `sites=${site}&parameterCd=${parameterCode}&startDT=${startDT}&endDT=${endDT}`;
    const url = `${config.GROUNDWATER_LEVELS_ENDPOINT}?${queryParams}&format=json`;

    return get(url)
        .then(response => JSON.parse(response))
        .catch(reason => {
            console.error(reason);
            return {};
        });
};