import {select} from 'd3-selection';
import List from 'list.js';

/*
 * Render the site table on elem. If networkSites exceeds 10000 then don't render the table.
 * @param {String} divId - where the table of sites will be rendered
 * * @param {Array of Objects} networkSites
 */
export const drawSiteTable = function(divId, networkSites) {
    if (networkSites.length < 10000) {
        const options = {
            valueNames: ['name', 'link',  { name: 'linkhref', attr: 'href' }],
            item: '<tr><td class="name"></td><td><a class="link linkhref"></a></td></tr>',
            page: 50,
            pagination: [{
                left: 1,
                right: 1,
                innerWindow: 2,
                outerWindow: 1
            }]
        };
        const listValues = networkSites.map((feature) => {
            return {
                'name': feature.properties.monitoringLocationName,
                'link': feature.properties.monitoringLocationUrl,
                'linkhref': feature.properties.monitoringLocationUrl
            };
        });

        new List(divId, options, listValues);
    } else {
        select(`#${divId}`).select('.overload-table').text('Too many sites to display in table');
    }
};