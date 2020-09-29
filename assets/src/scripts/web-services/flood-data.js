import {get} from '../ajax';
import config from '../config';

export const FLOOD_SITES_ENDPOINT = `${config.FIM_GIS_ENDPOINT}sites/MapServer/`;
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

	const FIM_SITE_QUERY = `${FLOOD_SITES_ENDPOINT}0/query?where=SITE_NO%3D%27${siteno}%27&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=PUBLIC%2CSITE_NO&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=pjson`;
    return get(FIM_SITE_QUERY)
        .then((response) => {
			const respJson = JSON.parse(response);

			const isPublic = respJson.features[0].attributes.Public;
			
			// If site is public, fetchFloodFeatures
			// 0 means in review/not public
			if(isPublic > 0){

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

			}else{
				return [];
			}
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
