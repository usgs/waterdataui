/*
*  Functions related to the selection of data sampling methods
*/



export const drawSamplingMethodRow = function(container, parameterCode, primarySamplingMethods, store) {
    console.log('ran method ')
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
    primarySamplingMethods.forEach(method => {
        console.log('method ', method)
        const checkboxDiv = checkboxFieldset.append('div')
            .attr('class', 'usa-checkbox');
        checkboxDiv.append('input')
            .attr('id', `checkbox-method-select-${method.methodID}`)
            .attr('class', 'usa-checkbox__input')
            .attr('type', 'checkbox')
            .attr('name', 'method-selection')
            .attr('value', method.methodID);
        checkboxDiv.append('label')
            .attr('class', 'usa-checkbox__label')
            .attr('for', `checkbox-method-select-${method.methodID}`)
            .text(method.methodDescription);

    });



    // gridRowSamplingMethodSelection.append('div')
    //     .attr('id', `method-selection-container-${parameterCode}`)
    //     .attr('class', 'grid-row method-selection-row')
    //     .text('Sampling Methods:');
    //
    // primarySamplingMethods.forEach(method => {
    //     gridRowSamplingMethodSelection.append('div')
    //         .attr('class', 'grid-row method-selection-row')
    //         .text(method.methodDescription);
    //     console.log('method ', method)
    // });
};