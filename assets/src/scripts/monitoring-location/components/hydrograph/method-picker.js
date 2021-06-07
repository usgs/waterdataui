/**
 * Pick list for methods module
 */

import {select} from 'd3-selection';

import {setSelectedIVMethodID} from 'ml/store/hydrograph-state';



/**
 * Draw the method picker. Remove the previous method picker and determine whether a new method
 * picker is needed before rendering the picker within the expanion constainer for the selected
 * parameterCode.
 * @param {D3 selection} container - An HTML element to serve as the base for attaching other elements.
 * @param {Object} sortedIVMethods - An object containing the parameter code and the list of sorted methods to be
 *      used for rendering.
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
