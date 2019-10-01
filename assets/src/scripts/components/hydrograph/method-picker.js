/**
 * Pick list for methods module
 */

import { select } from 'd3-selection';

import{ dispatch, link } from '../../lib/redux';
import { Actions } from '../../store';
import { getAllMethodsForCurrentVariable } from './time-series';

export const drawMethodPicker = function(elem) {
    const pickerContainer = elem.insert('div', ':nth-child(2)')
        .attr('id', 'ts-method-select-container');

    pickerContainer.append('label')
        .attr('class', 'usa-label')
        .attr('for', 'method-picker')
        .text('Description');
    pickerContainer.append('select')
        .attr('class', 'usa-select')
        .attr('id', 'method-picker')
        .on('change', dispatch(function() {
            return Actions.setCurrentMethodID(parseInt(select(this).property('value')));
        }))
        .call(link(function(elem, methods) {
            elem.selectAll('option').remove();
            methods.forEach((method) => {
                elem.append('option')
                    .text(method.methodDescription ? `${method.methodDescription} (${method.methodID})` : method.methodID)
                    .node().value = method.methodID;
            });
            if (methods.length) {
                elem.dispatch('change');
            }
        }, getAllMethodsForCurrentVariable));
};

