import {get} from 'ui/ajax';
import config from 'ui/config';

const NWIS_COLLECTION_ID = 'monitoring-locations';

/*
 * Fetches the data at using OBSERVATIONS_ENDPOINT + queryUrl. Returns a Promise which
 * resolves to the fetched data or an empty object if the retrieval failed.
 * @param {String} queryURL - The part of the url that should be appended to OBSERVATIONS_ENDPOINT
 * @param {Object} parameters - query parameters. The json format query parameter will be automatically added.
 */
const fetchObservationsData = function(queryUrl, parameters={}) {
    const queryParameters = {
        ...parameters,
        f: 'json'
    };
    const queryString = Object.keys(queryParameters).map((key) => `${key}=${queryParameters[key]}`).join('&');
    const url = `${config.OBSERVATIONS_ENDPOINT}${queryUrl}?${queryString}`;
    return get(url)
        .then(resp => JSON.parse(resp))
        .catch(reason => {
            console.log(`Unable to fetch data from ${url} with reason: ${reason}`);
            return {};
        });
};

/*
 * Retrieve an array of features for the networkCd
 * @param {String} networkCd
 * @param {Object} queryParameters
 * @return {Promise} resolves to an Array of feature Objects
 */
export const fetchNetworkMonitoringLocations = function(networkCd, queryParameters={}) {
    return fetchObservationsData(`collections/${networkCd}/items`, queryParameters)
       .then((response) => response.features ? response.features : []);
};


/*
 * Fetches the available DV time series and returns a Promise that returns a
 * GeoJson object containing the list of available time series
 * @param {String} monitoringLocationId
 * @returns {Promise}<Object>
 */
export const fetchAvailableDVTimeSeries = function(monitoringLocationId) {
    return fetchObservationsData(`collections/${NWIS_COLLECTION_ID}/items/${monitoringLocationId}/observations/statistical-time-series`);
};

/*
 * Fetches the dv timeSeries with timeSeriesId and monitoringLocationId and returns a Promise
 * that returns a GeoJson object containing the statistical time series
 * @param {String} monitoringLocation
 * @param {String} timeSeriesId
 * @return {Promise}<Object>
 */
export const fetchDVTimeSeries = function(monitoringLocationId, timeSeriesId) {
    return fetchObservationsData(`collections/${NWIS_COLLECTION_ID}/items/${monitoringLocationId}/observations/statistical-time-series/${timeSeriesId}`);
};

/*
 * Fetches the observation data with siteid and returns a Promise
 * that returns a GeoJson object containing the observation geojson
 * @param {String} monitoringLocation
 * @return {Promise}<Object>
 */
export const fetchMonitoringLocationMetaData = function(monitoringLocationId) {
    return fetchObservationsData(`collections/${NWIS_COLLECTION_ID}/items/USGS-${monitoringLocationId}`);
};