import config from 'ui/config';
import {get} from 'ui/ajax';

/*
 * Retrieve json data from the NETWORK_ENDPOINT/${networkQuery}
 * @param {String} networkQuery - should not begin with a '/'
 * @return {Promise} resolves to an Object
 */
const fetchNetworkData = function(networkQuery) {
    const url = `${config.NETWORK_ENDPOINT}/${networkQuery}`;
    return get(url)
        .then((responseText) => {
            return JSON.parse(responseText);
        })
        .catch(reason => {
            console.error(`Unable to retrieve data from ${url} with reason: ${reason}`);
            return {};
        });
};

/*
 * Retrieve an array of features for the networkCd
 * @parameter {String} networkCd
 * @return {Promise} resolves to an Array of feature Objects
 */
export const fetchNetworkFeatures = function(networkCd) {
    const networkQuery = `${networkCd}/items`;
    return fetchNetworkData(networkQuery)
        .then((response) => {
            return response.features ? response.features : [];
        });
};
