/**
 * Pick list for methods module
 */

import{ link } from '../../lib/redux';

import { getAllMethodsForCurrentVariable } from './time-series';

export const drawMethodPicker = function(elem) {
    const pickerContainer = elem.insert('div', ':nth-child(2)')
        .attr('id', 'ts-method-select-container');

    pickerContainer.append('label')
        .attr('class', 'usa-label')
        .attr('for', 'method-picker')
        .text('Available Methods');
    pickerContainer.append('select')
        .attr('class', 'usa-select')
        .attr('id', 'method-picker')
        .call(link(function(elem, methods) {
            elem.selectAll('option').remove();
            methods.forEach((method) => {
                elem.append('option')
                    .attr('value', method.methodId)
                    .text(method.methodDescription ? `${method.methodDescription} (${method.methodID})` : method.methodID);
            });
        }, getAllMethodsForCurrentVariable));
};

