import {get} from '../ajax';
import config from '../config';
import { tsvParse } from 'd3';

/*
 * Fetches the data at using OBSERVATIONS_ENDPOINT + queryUrl. Returns a Promise which
 * resolves to the fetched data or an empty object if the retrieval failed.
 */
const fetchWaterqualityData = function(queryUrl) {
    const url = `${config.WQP_LOOKUP_ENDPOINT}/${queryUrl}`;
    return get(url)
        .then(resp => tsvParse(resp))
        .catch(reason => {
            console.log(`Unable to fetch data from ${url} with reason: ${reason}`);
            return {};
        });
};

export const fetchSitesInBbox = function ({ west, south, east, north }) {
    return fetchWaterqualityData(`data/Station/search?mimeType=tsv&bbox=${west},${south},${east},${north}`);
};
