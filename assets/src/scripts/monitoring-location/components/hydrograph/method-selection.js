/*
*  Functions related to the selection of data sampling methods
*/



export const drawSamplingMethodRow = function(container, parameterCode, primarySamplingMethods, store) {
    console.log('ran method ')
    const gridRowSamplingMethodSelection = container.append('div')
        .attr('id', 'primary-sampling-method-row')
        .attr('class', 'grid-container grid-row-inner');

    gridRowSamplingMethodSelection.append('div')
        .attr('id', `method-selection-container-${parameterCode}`)
        .attr('class', 'grid-row method-selection-row')
        .append('form')
            .attr('class', 'usa-form')
            .append('legend')
                .attr('class', 'usa-legend')
                .text('Sampling Methods:');

    

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