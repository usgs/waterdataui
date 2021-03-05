/**
 * Pick list for methods module
 */

import {select} from 'd3-selection';
import {createStructuredSelector} from 'reselect';

import{link}  from 'ui/lib/d3-redux';

import {getPrimaryMethods} from 'ml/selectors/hydrograph-data-selector';
import {getSelectedIVMethodID} from 'ml/selectors/hydrograph-state-selector';
import {setSelectedIVMethodID} from 'ml/store/hydrograph-state';

export const drawMethodPicker = function(elem, store, initialTimeSeriesId) {
    const pickerContainer = elem.append('div')
        .attr('id', 'ts-method-select-container');

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
        .call(link(store, function(elem, {methods}) {
            let selectedMethodID = getSelectedIVMethodID(store.getState());
            elem.selectAll('option').remove();
            if (!methods) {
                return;
            }
            if (methods.length &&
                (!selectedMethodID || !methods.find(method => method.methodID === selectedMethodID))) {
                // Set the selected method ID to the first one in the list
                selectedMethodID = methods[0].methodID;
            }
            methods.forEach((method) => {
                elem.append('option')
                    .text(method.methodDescription ? `${method.methodDescription}` : 'None')
                    .attr('selected', method.methodID === selectedMethodID ? true : null)
                    .node().value = method.methodID;
            });
            pickerContainer.attr('hidden', methods.length <= 1 ? true: null);
            if (methods.length) {
                elem.dispatch('change');
            }
        }, createStructuredSelector({
            methods: getPrimaryMethods
        })));
};

