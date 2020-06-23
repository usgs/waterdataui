import {select} from 'd3-selection';
import {Actions as networkActions} from "../store/network";
import {hasNetworkData, getNetworkList} from "../selectors/network-selector";
import {createStructuredSelector} from "reselect";
import {link} from "../lib/d3-redux";


export const attachToNode = function (store,
                                      node,
                                      {siteno}) {

    const fetchDataPromise = store.dispatch(networkActions.retrieveNetworkListData(siteno));
    console.log('promised');
    fetchDataPromise.then(() => {
        console.log('you made it in her finally');
        select(node).call(link(store, addNetworkRows, createStructuredSelector({
            hasData: hasNetworkData,
            networkList: getNetworkList
        })));
    });
};

const addNetworkRows = function(node, {hasData, networkList}){
    if (hasData){
        console.log(networkList);
        const input = node.select('#network-list-table');
        input.append('thead').html(
            "<tr><th>Name</th><th>Link</th></tr>"
        );
        const tbody = input.append('tbody')

        let tbodyHTML = '';
        networkList.forEach(function(network) {
            tbodyHTML += `<tr><td>${network.title}</td><td><a href="${network.href}">
                ${network.href}</a></td></tr>`;
        })

        tbody.html(tbodyHTML);

    } else{
        node.html('<p>No network data is available</p>');
    }
};