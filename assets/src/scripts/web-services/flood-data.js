import {get} from 'ui/ajax';
import config from 'ui/config';

export const FLOOD_EXTENTS_ENDPOINT = `${config.FIM_GIS_ENDPOINT}floodExtents/MapServer/`;
export const FLOOD_BREACH_ENDPOINT = `${config.FIM_GIS_ENDPOINT}breach/MapServer/`;
export const FLOOD_LEVEE_ENDPOINT = `${config.FIM_GIS_ENDPOINT}suppLyrs/MapServer/`;
const WATERWATCH_URL = config.WATERWATCH_ENDPOINT;
const FORMAT = 'json';

/*
 * Retrieve flood features if any for siteno
 * @param {String} siteno
 * @return {Promise} resolves to an array of features for the site
 */
export const fetchFloodFeatures = function(siteno) {
    const FIM_QUERY = `${FLOOD_EXTENTS_ENDPOINT}/0/query?where=USGSID+%3D+%27${siteno}%27&outFields=USGSID%2C+STAGE&returnGeometry=false&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=falsereturnDistinctValues=false&f=json`;

    return get(FIM_QUERY)
        .then((response) => {
            const respJson = JSON.parse(response);
            return respJson.features ? respJson.features : [];
        })
        .catch(reason => {
            console.log(`Unable to get FIM data for ${siteno} with reason: ${reason}`);
            return [];
        });
};

/*
 * Retrieve the extent of the flood information for siteno
 * @param {String} siteno
 * @return {Promise} resolves to the extent Object or the empty object if an errors
 */
export const fetchFloodExtent = function(siteno){
    const FIM_QUERY = `${FLOOD_EXTENTS_ENDPOINT}/0/query?where=USGSID+%3D+%27${siteno}%27&returnExtentOnly=true&outSR=4326&f=json`;
    return get(FIM_QUERY)
        .then((response) => {
            return JSON.parse(response);
        })
        .catch(reason => {
            console.log(`Unable to get FIM data for ${siteno} with reason: ${reason}`);
            return {};
        });
};


/*
 * Retrieve waterwach flood levels any for siteno
 * @param {String} siteno
 * @return {Promise} resolves to an array of features for the site
 */
const fetchWaterwatchData = function(waterwatchQuery, siteno) {
    return get(waterwatchQuery)
        .then((responseText) => {
            const responseJson = JSON.parse(responseText).sites[0];
            return responseJson ? responseJson : null;
        })
        .catch(reason => {
            console.log(`Unable to get Waterwatch data for ${siteno} with reason: ${reason}`);
            return null;
        });
};

// waterwatch webservice calls
export const fetchWaterwatchFloodLevels = function(siteno) {
    const waterwatchQuery = `${WATERWATCH_URL}/floodstage?format=${FORMAT}&site=${siteno}`;
    return fetchWaterwatchData(waterwatchQuery, siteno);
};
