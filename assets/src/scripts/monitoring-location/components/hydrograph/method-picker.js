/**
 * Pick list for methods module
 */

import {select} from 'd3-selection';

import{link}  from 'ui/lib/d3-redux';

import {getPrimaryMethods} from 'ml/selectors/hydrograph-data-selector';
import {getSelectedIVMethodID} from 'ml/selectors/hydrograph-state-selector';

import {setSelectedIVMethodID} from 'ml/store/hydrograph-state';

import {getPreferredIVMethodID} from './selectors/time-series-data';

const updateAvailableMethods = function(selectElem, methods, store) {
    selectElem.selectAll('option').remove();
    if (!methods || !methods.length) {
        return;
    }
    let selectedMethodID = getSelectedIVMethodID(store.getState());
    const availableMethodIDs = methods.map(data => data.methodID);
    if (selectedMethodID && !availableMethodIDs.includes(selectedMethodID)) {
        selectedMethodID = getPreferredIVMethodID(store.getState());
        store.dispatch(setSelectedIVMethodID(selectedMethodID));
    }

    methods.forEach((method) => {
        selectElem.append('option')
            .text(method.methodDescription ? `${method.methodDescription}` : 'None')
            .attr('selected', method.methodID === selectedMethodID ? true : null)
            .node().value = method.methodID;
        });
};

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
        .on('change', function() {
            store.dispatch(setSelectedIVMethodID(select(this).property('value')));
        })
        .call(link(store, updateAvailableMethods, getPrimaryMethods, store));
};

