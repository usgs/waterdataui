import { get } from './ajax';
import config from './config';


export const FLOOD_EXTENTS_ENDPOINT = `${config.FIM_GIS_ENDPOINT}floodExtents/MapServer/`;
export const FLOOD_BREACH_ENDPOINT = `${config.FIM_GIS_ENDPOINT}breach/MapServer/`;
export const FLOOD_LEVEE_ENDPOINT = `${config.FIM_GIS_ENDPOINT}suppLyrs/MapServer/`;

/*
 * Retrieve flood features if any for siteno
 * @param {String} siteno
 * @return {Promise} resolves to an array of features for the site
 */
export const fetchFloodFeatures = function(siteno, getImpl = get) {
    const FIM_QUERY = `${FLOOD_EXTENTS_ENDPOINT}/0/query?where=USGSID+%3D+%27${siteno}%27&outFields=USGSID%2C+STAGE&returnGeometry=false&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=falsereturnDistinctValues=false&f=json`;

    return getImpl(FIM_QUERY)
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
export const fetchFloodExtent = function(siteno, getImpl = get){
    const FIM_QUERY = `${FLOOD_EXTENTS_ENDPOINT}/0/query?where=USGSID+%3D+%27${siteno}%27&returnExtentOnly=true&outSR=4326&f=json`;
    return getImpl(FIM_QUERY)
        .then((response) => {
            return JSON.parse(response);
        })
        .catch(reason => {
            console.log(`Unable to get FIM data for ${siteno} with reason: ${reason}`);
            return {};
        });
};
