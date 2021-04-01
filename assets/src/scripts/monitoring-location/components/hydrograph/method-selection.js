/*
*  Functions related to the selection of data sampling methods
*/

import {getPreferredIVMethodID, getSortedIVMethodID} from './selectors/time-series-data';
import {getSelectedIVMethodID} from 'ml/selectors/hydrograph-state-selector';

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

    const checkboxContainer = gridRowSamplingMethodSelection.append('div')
        .attr('id', `method-selection-container-${parameterCode}`)
        .attr('class', 'grid-row method-selection-row')
        .append('form')
            .attr('class', 'usa-form');
    const checkboxFieldset = checkboxContainer.append('fieldset')
                .attr('class', 'usa-fieldset');
    checkboxFieldset.append('legend')
                    .attr('class', 'usa-legend')
                    .text('Sampling Methods:');
    const sortedMethods = getSortedIVMethodID(store.getState());
    console.log('sortedMethods ', sortedMethods)
    sortedMethods.forEach((method, index) => {
        console.log('index', index)
        console.log('method.methodID ', method.methodID)
        console.log('selectedMethodID ', selectedMethodID)
        const checkboxDiv = checkboxFieldset.append('div')
            .attr('class', 'usa-checkbox');
        checkboxDiv.append('input')
            .attr('id', `checkbox-method-select-${method.methodID}`)
            .attr('class', 'usa-checkbox__input')
            .attr('type', 'checkbox')
            .attr('name', 'method-selection')
            .property('checked', index === 0 ? true : null)
            // .property('checked', method.methodID === '57499' ? true : null)
            .attr('value', method.methodID);
        checkboxDiv.append('label')
            .attr('class', 'usa-checkbox__label')
            .attr('for', `checkbox-method-select-${method.methodID}`)
            .text(method.methodDescription);
    });
};