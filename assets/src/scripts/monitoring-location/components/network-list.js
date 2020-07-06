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
        let input = node.append('ul')
        .classed('usa-fieldset', true)
        .classed('usa-list--unstyled', true);
        
        let networkUrl;
        networkList.forEach(function(network) {
            console.log(network.title);
            networkUrl = buildNetworkURL(network.href);
            input.append('li')
                .append('a')
                .classed('usa-link', true)
                .attr('href', networkUrl)
                .text(network.title);
        });

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

