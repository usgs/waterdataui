import config from './config';
import { get } from './ajax';

const nldiUrl = config.NLDI_SERVICES_ENDPOINT;
const featureSource = 'nwissite';
const dataSource = 'nwissite';
const usgs = 'USGS-';
const upstreamNavigation = 'UM';
const downstreamNavigation = 'DM';
const distanceParam = `?distance=${config.NLDI_SERVICES_DISTANCE}`;


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
export const fetchNldiUpstreamSites = function(siteno) {
    const upstreamSitesQuery = nldiUrl + '/'+ featureSource + '/' + usgs + siteno + '/navigate/' + upstreamNavigation + '/' + dataSource + distanceParam;
    return fetchNldiData(upstreamSitesQuery, siteno);
};

export const fetchNldiUpstreamFlow = function(siteno) {
    const upstreamFlowQuery = nldiUrl + '/'+ featureSource + '/' + usgs + siteno + '/navigate/' + upstreamNavigation + distanceParam;
    return fetchNldiData(upstreamFlowQuery, siteno);
};

export const fetchNldiDownstreamSites = function(siteno) {
    const downstreamSitesQuery = nldiUrl + '/'+ featureSource + '/' + usgs + siteno + '/navigate/' + downstreamNavigation + '/' + dataSource + distanceParam;
    return fetchNldiData(downstreamSitesQuery, siteno);
};

export const fetchNldiDownstreamFlow = function(siteno) {
    const downStreamFlowQuery = nldiUrl + '/'+ featureSource + '/' + usgs + siteno + '/navigate/' + downstreamNavigation + distanceParam;
    return fetchNldiData(downStreamFlowQuery, siteno);
};
