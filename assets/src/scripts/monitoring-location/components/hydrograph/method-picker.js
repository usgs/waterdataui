/**
 * Pick list for methods module
 */

import {select} from 'd3-selection';

import{link}  from 'ui/lib/d3-redux';

import {getSelectedIVMethodID} from 'ml/selectors/hydrograph-state-selector';

import {setSelectedIVMethodID} from 'ml/store/hydrograph-state';

import {showDataIndicators} from './data-indicator';
import {getPreferredIVMethodID, getSortedIVMethods} from './selectors/time-series-data';

/**
 * Changes the list of methods when the parameter changes
 * @param {D3 selection} container- An HTML element to serve as the base for attaching other elements.
 * @param {Object} methods - The complete list of sampling methods available for the selected parameter.
 * @param {Redux store} store - A complex JavaScript object that maps the current state of the application.
 */
const updateAvailableMethods = function(container, methods, store) {
    container.selectAll('option').remove();
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
        console.log(`${method.methodID} method.pointCount `, method.pointCount)
        const hasNoPointsInTimeSpan = method.pointCount === 0;
        container.append('option')
            .text(`${method.methodDescription}`)
            .attr('class', 'method-option sampling-method-selection')
            .attr('selected', method.methodID === selectedMethodID ? true : null)
            .attr('value', method.methodID)
            .attr('disabled', hasNoPointsInTimeSpan ? true : null);
        });
};

/**
 * Draw the method picker. It will be set initially to the preferred method id if not already
 * set to a specific, available method id. The picker will be hidden if only one method
 * is available for the IV data.
 * @param {D3 selection} container - An HTML element to serve as the base for attaching other elements.
 * @param {String} parameterCode - The five digit USGS that is unique for each parameter.
 * @param {Redux store} store - A complex JavaScript object that maps the current state of the application.
 */
export const drawMethodPicker = function(container, parameterCode, store) {
    const gridRowSamplingMethodSelection = container.append('div')
        .attr('id', 'primary-sampling-method-row')
        .attr('class', 'grid-container grid-row-inner sampling-method-selection');
    const methodSelectionContainer = gridRowSamplingMethodSelection.append('div')
        .attr('class', 'grid-row method-selection-row sampling-method-selection');
    const pickerContainer = methodSelectionContainer.append('div')
        .attr('id', 'ts-method-select-container')
        .call(link(store, (container, methods) => {
            container.attr('hidden', methods && methods.length > 1 ? null : true);
        }, getSortedIVMethods));

    pickerContainer.append('label')
        .attr('class', 'usa-label sampling-method-selection')
        .attr('for', 'method-picker');
    pickerContainer.text('Sampling Methods:')
        .call(link(store, (container, methods) => {
            if (methods !== null) {
                const hasMethodsWithNoPointsInTimeRange = methods.filter(method => method.pointCount === 0).length !== 0;
                if(hasMethodsWithNoPointsInTimeRange) {
                    container.append('span')
                        .attr('id', 'no-data-points-note')
                        .text(' note - some methods are disabled, because there are no data points for these methods in your selected time span');
                }
            }
        }, getSortedIVMethods));

    pickerContainer.append('select')
        .attr('class', 'usa-select sampling-method-selection')
        .attr('id', 'method-picker')
        .call(link(store, updateAvailableMethods, getSortedIVMethods, store))
    .on('change', function() {
            store.dispatch(setSelectedIVMethodID(select(this).property('value')));
            showDataIndicators(false, store);
        });
};
