
import { get } from '../ajax';
import config from '../config';

/*
 * Return a promise that returns the web serivce payload is successful. If the
 * request is not successfuly an empty object will be returned
 * @param {String} monitoringLocation
 * @param {String} timeSeriesId
 * @return {Promise}<Object>
 */
export const fetchTimeSeries = function(monitoringLocationId, timeSeriesId) {
    return get(`${config.OBSERVATIONS_ENDPOINT}monitoring-location/${monitoringLocationId}/time-series/${timeSeriesId}`)
        .then((response) => JSON.parse(response))
        .catch(reason => {
            console.log(`Unable to fetch observations time-series ${timeSeriesId} for monitoring location 
                ${monitoringLocationId} with reason: ${reason}`);
            return {};
        });
};