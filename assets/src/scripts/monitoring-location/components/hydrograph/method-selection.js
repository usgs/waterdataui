/*
*  Functions related to the selection of data sampling methods
*/
import {select} from 'd3-selection';

import {getPreferredIVMethodID, getSortedIVMethods} from './selectors/time-series-data';
import {getSelectedIVMethodID} from 'ml/selectors/hydrograph-state-selector';

import {setSelectedIVMethodID} from 'ml/store/hydrograph-state';
import {showDataIndicators} from './data-indicator';

export const drawSamplingMethodRow = function(container, parameterCode, primarySamplingMethods, store) {
    console.log('ran method ')

    let selectedMethodID = getSelectedIVMethodID(store.getState());
    const availableMethodIDs = primarySamplingMethods.map(data => data.methodID);
    if (!selectedMethodID || selectedMethodID && !availableMethodIDs.includes(selectedMethodID)) {
        selectedMethodID = getPreferredIVMethodID(store.getState());
    }

    const gridRowSamplingMethodSelection = container.append('div')
        .attr('id', 'primary-sampling-method-row')
        .attr('class', 'grid-container grid-row-inner');
    const methodSelectionContainer = gridRowSamplingMethodSelection.append('div')
        .attr('id', `method-selection-container-${parameterCode}`)
        .attr('class', 'grid-row method-selection-row')
        .append('form')
            .attr('class', 'usa-form');
    const checkboxFieldset = methodSelectionContainer.append('fieldset')
                .attr('class', 'usa-fieldset');
    checkboxFieldset.append('legend')
                    .attr('class', 'usa-legend')
                    .text('Sampling Methods:');

    const sortedMethods = getSortedIVMethods(store.getState());
    console.log('sortedMethods ', sortedMethods)
    sortedMethods.forEach((method, index) => {
        const checkboxDiv = checkboxFieldset.append('div')
            .attr('class', 'usa-radio radio-method-selection');
       checkboxDiv.append('input')
            .attr('id', `radio-method-select-${method.methodID}`)
            .attr('class', 'usa-radio__input')
            .attr('type', 'radio')
            .attr('name', 'method-selection')
            .property('checked', index === 0 && method.pointCount > 0 ? true : null)
            .property('disabled', method.pointCount < 1 ? true : null)
            .attr('value', method.methodID)
            .on('change', function() {
                console.log('changed ', select(this).property('value'))
                store.dispatch(setSelectedIVMethodID(select(this).property('value')));
                showDataIndicators(false, store);
            });
            checkboxDiv.append('label')
                .attr('class', 'usa-radio__label')
                .attr('for', `radio-method-select-${method.methodID}`)
                .text(`${method.methodDescription} ${method.pointCount < 1 ? '(no data points in selected time span)' : ''}`);
    });
};