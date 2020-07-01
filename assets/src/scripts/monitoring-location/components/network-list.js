import {select} from 'd3-selection';
import {createStructuredSelector} from 'reselect';

import {link} from '../../lib/d3-redux';

import {Actions as networkActions} from '../store/network';
import {hasNetworkData, getNetworkList} from '../selectors/network-selector';

/*
 * function to build a network URL from a labs json url
 * @param {String} link
 * @return {String} network link
 */
const buildNetworkURL = function(link) {
    const networkTitle = link.split('/')[6].split('?')[0];
    let baseURL = String(window.location);
    baseURL = baseURL.slice(0, baseURL.indexOf('monitoring-location'));
    return `${baseURL}networks/${networkTitle}`;
};

const addNetworkRows = function(node, {hasData, networkList}){
    if (hasData){
        const input = node.append('ul')
        .classed('usa-fieldset', true)
        .classed('usa-list--unstyled', true)

        let ulHTML = '';
        let networkUrl;
        networkList.forEach(function(network) {
            networkUrl = buildNetworkURL(network.href);
            ulHTML += `<li><a class="usa-link" href="${networkUrl}">
                ${network.title}</a></li>`;
        });

        input.html(ulHTML);

    } else{
        node.html('<p>This site is not in any networks</p>');
    }
};

export const attachToNode = function (store,
                                      node,
                                      {siteno}) {

    const fetchDataPromise = store.dispatch(networkActions.retrieveNetworkListData(siteno));
    fetchDataPromise.then(() => {
        select(node).call(link(store, addNetworkRows, createStructuredSelector({
            hasData: hasNetworkData,
            networkList: getNetworkList
        })));
    });
};

