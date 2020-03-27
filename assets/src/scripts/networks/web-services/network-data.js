import config from '../../config';
import {get} from '../../ajax';

const networkUrl = config.NETWORK_ENDPOINT;

/*
 * Retrieve network features if any for network cd
 * @param {String} networkCd
 * @return {Promise} resolves to an array of features for the site
 */
const fetchNetworkData = function(networkQuery, networkCd) {
    return get(networkQuery)
        .then((responseText) => {
            const responseJson = JSON.parse(responseText);
            return responseJson.features ? responseJson.features : [];
        })
        .catch(reason => {
            console.error(`Unable to get network data for ${networkCd} with reason: ${reason}`);
            return [];
        });
};

// network webservice calls
export const fetchNetworkSites = function(networkCd) {
    const networkQuery = `${networkUrl}/${networkCd}/items`;
    return fetchNetworkData(networkQuery, networkCd);
};