import {DateTime} from 'luxon';

import config from 'ui/config';

/*
* Creates a URL that is used to call the graph server and return a static image of the hydrograph
* @param {Object} queryParameterParts - contains information needed to construct the graph server URL
* such as site number and parameter codes
*/
export const generateStaticGraphURL = function(queryParameterParts) {
    const siteNumber = Object.keys(queryParameterParts.siteNumber);
    const parameterCode = queryParameterParts.parameterCode ? queryParameterParts.parameterCode :  '00060';
    const timePeriod = queryParameterParts.currentDateRange ? queryParameterParts.currentDateRange : null;
    const isCompareSelected = queryParameterParts.timeSeriesShowOnGraphOptions.compare ? queryParameterParts.timeSeriesShowOnGraphOptions.compare : false;
    let customStartDate;
    let customEndDate;
    if (queryParameterParts.customTimeRange) {
        customStartDate = queryParameterParts.customTimeRange.start ?  DateTime.fromMillis(queryParameterParts.customTimeRange.start, {zone: queryParameterParts.timeZone}).toFormat('yyyy-LL-dd') : null;
        customEndDate = queryParameterParts.customTimeRange.end ?  DateTime.fromMillis(queryParameterParts.customTimeRange.end, {zone: queryParameterParts.timeZone}).toFormat('yyyy-LL-dd') : null;
    }

    let url = `${config.GRAPH_SERVER_ENDPOINT}/monitoring-location/${siteNumber}/?parameterCode=${parameterCode}`;
    if (timePeriod && timePeriod !== 'custom') {
        url = `${url}&period=${timePeriod}&compare=${isCompareSelected}`;
    } else if (customStartDate && customEndDate) {
        url = `${url}&startDT=${customStartDate}&endDT=${customEndDate}`;
    }

    return url;
};

/*
 * Adds an image tag to the target element so that an image from the graph server can be inserted into the tag.
 * @param {D3 selection} elem
 * @param {Object} queryParameterParts - contains information needed to construct the graph server URL
 *  such as site number and parameter codes
 */
export const getStaticGraph = function(elem, queryParameterParts) {
    const graphServerURL = generateStaticGraphURL(queryParameterParts);
    const staticGraphContainer = document.getElementById('static-ivgraph-container');

    if (staticGraphContainer) {
        staticGraphContainer.remove();
    }
    elem.append('div').attr('id', 'static-ivgraph-container')
        .append('img').attr('src', `${graphServerURL}`);
};
