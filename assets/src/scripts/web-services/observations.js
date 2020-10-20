import {get} from 'ui/ajax';
import config from 'ui/config';

/*
 * Fetches the data at using OBSERVATIONS_ENDPOINT + queryUrl. Returns a Promise which
 * resolves to the fetched data or an empty object if the retrieval failed.
 */
const fetchObservationsData = function(queryUrl) {
    const url = `${config.OBSERVATIONS_ENDPOINT}/${queryUrl}`;
    return get(url)
        .then(resp => JSON.parse(resp))
        .catch(reason => {
            console.log(`Unable to fetch data from ${url} with reason: ${reason}`);
            return {};
        });
};

/*
 * Fetches the available DV time series and returns a Promise that returns a
 * GeoJson object containing the list of available time series
 * @param {String} monitoringLocationId
 * @returns {Promise}<Object>
 */
export const fetchAvailableDVTimeSeries = function(monitoringLocationId) {
    return fetchObservationsData(`items/${monitoringLocationId}/observations/statistical-time-series`);
};

/*
 * Fetches the dv timeSeries with timeSeriesId and monitoringLocationId and returns a Promise
 * that returns a GeoJson object containing the statistical time series
 * @param {String} monitoringLocation
 * @param {String} timeSeriesId
 * @return {Promise}<Object>
 */
export const fetchDVTimeSeries = function(monitoringLocationId, timeSeriesId) {
    return fetchObservationsData(`items/${monitoringLocationId}/observations/statistical-time-series/${timeSeriesId}`);
};

/*
 * Fetches the observation data with siteid and returns a Promise
 * that returns a GeoJson object containing the observation geojson
 * @param {String} monitoringLocation
 * @return {Promise}<Object>
 */
export const fetchMonitoringLocationMetaData = function(monitoringLocationId) {
    return fetchObservationsData(`items/USGS-${monitoringLocationId}`);
};