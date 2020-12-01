import {get} from 'ui/ajax';
import config from 'ui/config';

const NLDI_URL = config.NLDI_SERVICES_ENDPOINT;
const FEATURE_SOURCE = 'nwissite';
const DISTANCE_PARAM = `?distance=${config.NLDI_SERVICES_DISTANCE}`;

const getFeatureId = function(siteno) {
    return `USGS-${siteno}`;
};

/*
 * Retrieve nldi features if any for siteno
 * @param {String} siteno
 * @return {Promise} resolves to an array of features for the site
 */
const fetchNldiData = function(nldiQuery, siteno) {
    return get(nldiQuery)
        .then((responseText) => {
            const responseJson = JSON.parse(responseText);
            return responseJson.features ? responseJson.features : [];
        })
        .catch(reason => {
            console.error(`Unable to get NLDI data for ${siteno} with reason: ${reason}`);
            return [];
        });
};

// nldi webservice calls
export const fetchNldiUpstreamFlow = function(siteno) {
    const upstreamFlowQuery = `${NLDI_URL}/${FEATURE_SOURCE}/${getFeatureId(siteno)}/navigation/UM/flowlines${DISTANCE_PARAM}`;
    return fetchNldiData(upstreamFlowQuery, siteno);
};

export const fetchNldiDownstreamFlow = function(siteno) {
    const downStreamFlowQuery = `${NLDI_URL}/${FEATURE_SOURCE}/${getFeatureId(siteno)}/navigation/DM/flowlines${DISTANCE_PARAM}`;
    return fetchNldiData(downStreamFlowQuery, siteno);
};

export const fetchNldiUpstreamBasin = function(siteno) {
    const upStreamBasinQuery = `${NLDI_URL}/${FEATURE_SOURCE}/${getFeatureId(siteno)}/basin`;
    return fetchNldiData(upStreamBasinQuery, siteno);
};
