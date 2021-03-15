/**
 * Pick list for methods module
 */

import {select} from 'd3-selection';

import{link}  from 'ui/lib/d3-redux';

import {getPrimaryMethods} from 'ml/selectors/hydrograph-data-selector';
import {getSelectedIVMethodID} from 'ml/selectors/hydrograph-state-selector';

import {setSelectedIVMethodID} from 'ml/store/hydrograph-state';

import {showDataIndicators} from './data-indicator';
import {getPreferredIVMethodID} from './selectors/time-series-data';

const updateAvailableMethods = function(selectElem, methods, store) {
    selectElem.selectAll('option').remove();
    if (!methods || !methods.length) {
        return;
    }
    let selectedMethodID = getSelectedIVMethodID(store.getState());
    const availableMethodIDs = methods.map(data => data.methodID);
    if (!selectedMethodID || selectedMethodID && !availableMethodIDs.includes(selectedMethodID)) {
        selectedMethodID = getPreferredIVMethodID(store.getState());
        store.dispatch(setSelectedIVMethodID(selectedMethodID));
        showDataIndicators(false, store);
    }

    methods.forEach((method) => {
        selectElem.append('option')
            .text(method.methodDescription ? `${method.methodDescription}` : 'None')
            .attr('selected', method.methodID === selectedMethodID ? true : null)
            .node().value = method.methodID;
        });
};

/*
 * Draw the method picker. It will be set initially to the preferred method id if not already
 * set to a specific, available method id. The picker will be hidden if only one method
 * is available for the IV data.
 * @param {D3 selection} elem
 * @param {Redux store} store
 */
export const drawMethodPicker = function(elem, store) {
    const pickerContainer = elem.append('div')
        .attr('id', 'ts-method-select-container')
        .call(link(store, (elem, methods) => {
            elem.attr('hidden', methods && methods.length > 1 ? null : true);
        },
        getPrimaryMethods));

    pickerContainer.append('label')
        .attr('class', 'usa-label')
        .attr('for', 'method-picker')
        .text('Description');
    pickerContainer.append('select')
        .attr('class', 'usa-select')
        .attr('id', 'method-picker')
        .call(link(store, updateAvailableMethods, getPrimaryMethods, store))
        .on('change', function() {
            store.dispatch(setSelectedIVMethodID(select(this).property('value')));
            showDataIndicators(false, store);
        });
};
