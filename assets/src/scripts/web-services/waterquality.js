import {post} from '../ajax';
import config from '../config';
import { tsvParse } from 'd3';

/*
 * Fetches the data at using OBSERVATIONS_ENDPOINT + queryUrl. Returns a Promise which
 * resolves to the fetched data or an empty object if the retrieval failed.
 */
const fetchWaterqualityData = function(queryUrl, payload) {
    const url = `${config.WQP_LOOKUP_ENDPOINT}/${queryUrl}`;
    return post(url, payload, {'Content-Type':'application/json'})
        .then(resp => {
            return tsvParse(resp);
          })
        .catch(reason => {
            console.log(`Unable to fetch data from ${url} with reason: ${reason}`);
            return {};
        });
};

export const fetchSitesInBbox = function ({ west, south, east, north }, characteristic) {
    const bboxStr = `"bbox":"${west},${south},${east},${north}"`;
    const charStr = `"characteristicName":["${characteristic}"]`;
    const query = `{${bboxStr},${charStr}}`;
    
    if (characteristic) return fetchWaterqualityData('data/Station/search?mimeType=tsv', query);
};
