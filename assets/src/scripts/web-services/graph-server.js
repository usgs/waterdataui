import config from 'ui/config';
import {get} from 'ui/ajax';

/*
* Retrieve a static image of the graph from the graph server
*  @param {String} graphServerQuery - the query string for that will be added to the base url.
*       Should be in the form of monitoring-location/{site number}/?parameterCode={parameter code}
*       for example, monitoring-location/05370000/?parameterCode=00060 (note do not add a '/' slash at the start)
 */
export const fetchStaticGraphImage = function(graphServerQuery) {
    const url = `${config.GRAPH_SERVER_ENDPOINT}/${graphServerQuery}`;
    return get(url)
        .then((response) => {
            return response;
        })
        .catch(reason => {
            console.error(`Unable to retrieve data from ${url} with reason: ${reason}`);
            return {};
        });
};