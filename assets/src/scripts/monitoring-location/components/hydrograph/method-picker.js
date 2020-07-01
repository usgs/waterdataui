/**
 * Pick list for methods module
 */

import {select} from 'd3-selection';
import {createStructuredSelector} from 'reselect';

import{link}  from '../../../lib/d3-redux';

import {getCurrentMethodID, getAllMethodsForCurrentVariable} from '../../selectors/time-series-selector';
import {Actions} from '../../store/instantaneous-value-time-series-state';

import { } from './selectors/time-series-data';

export const drawMethodPicker = function(elem, store) {
    const pickerContainer = elem.insert('div', ':nth-child(2)')
        .attr('id', 'ts-method-select-container');

    pickerContainer.append('label')
        .attr('class', 'usa-label')
        .attr('for', 'method-picker')
        .text('Description');
    pickerContainer.append('select')
        .attr('class', 'usa-select')
        .attr('id', 'method-picker')
        .on('change', function() {
            store.dispatch(Actions.setCurrentIVMethodID(parseInt(select(this).property('value'))));
        })
        .call(link(store,function(elem, {methods, currentMethodId}) {
            const currentMethodIdString = parseInt(currentMethodId);
            elem.selectAll('option').remove();
            methods.forEach((method) => {
                elem.append('option')
                    .text(method.methodDescription ? `${method.methodDescription}` : 'None')
                    .attr('selected', currentMethodIdString === method.methodID ? true : null)
                    .node().value = method.methodID;
            });
            pickerContainer.property('hidden', methods.length <= 1);
            if (methods.length) {
                elem.dispatch('change');
            }
        }, createStructuredSelector({
            methods: getAllMethodsForCurrentVariable,
            currentMethodId: getCurrentMethodID
        })));
};

