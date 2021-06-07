/**
 * Pick list for methods module
 */

import {select} from 'd3-selection';

import {setSelectedIVMethodID} from 'ml/store/hydrograph-state';

import {showDataIndicators} from './data-indicator';


/**
 * Draw the method picker. It will be set initially to the preferred method id if not already
 * set to a specific, available method id. The picker will be hidden if only one method
 * is available for the IV data.
 * @param {D3 selection} container - An HTML element to serve as the base for attaching other elements.
 * @param {Object} parameter - Details about the parameter, including the code and possible methods.
 * @param {Redux store} store - A complex JavaScript object that maps the current state of the application.
 */
export const drawMethodPicker = function(container, sortedIVMethods, store) {
    container.select('#primary-sampling-method-row').remove();

    if (!sortedIVMethods || sortedIVMethods.methods.length < 2) {
        return;
    }

    const hasMethodsWithNoPointsInTimeRange = sortedIVMethods.methods.filter(method => method.pointCount === 0).length !== 0;
    // Find parameter expansion container
    const rowContainer = container.select(`#expansion-container-row-${sortedIVMethods.parameterCode}`);
    const gridRowSamplingMethodSelection = rowContainer.append('div')
        .attr('id', 'primary-sampling-method-row')
        .attr('class', 'grid-container grid-row-inner');
    const methodSelectionContainer = gridRowSamplingMethodSelection.append('div')
        .attr('class', 'grid-row method-selection-row');
    const pickerContainer = methodSelectionContainer.append('div')
        .attr('id', 'ts-method-select-container');

    pickerContainer.append('label')
        .attr('class', 'usa-label')
        .attr('for', 'method-picker')
        .text('Sampling Methods:');

    if(hasMethodsWithNoPointsInTimeRange) {
        pickerContainer.append('span')
            .attr('id', 'no-data-points-note')
            .text(' note - some methods are disabled, because there are no data points for these methods in your selected time span');
    }

    const picker = pickerContainer.append('select')
        .attr('class', 'usa-select ')
        .attr('id', 'method-picker');
    sortedIVMethods.methods.forEach((method, index) => {
        picker.append('option')
            .text(`${method.methodDescription}`)
            .attr('class', 'method-option')
            .attr('selected', index === 0 ? true : null)
            .attr('value', method.methodID)
            .attr('disabled', method.pointCount === 0 ? true : null)
            .on('change', function(event) {
                event.stopPropagation();
                store.dispatch(setSelectedIVMethodID(select(this).property('value')));
            });
    });
};
