/*
*  Functions related to the selection of data sampling methods
*/

export const drawSamplingMethodRow = function(container, parameterCode, store) {
    const gridRowSamplingMethodSelection = container.append('div')
        .attr('class', 'grid-row grid-row-inner');

    gridRowSamplingMethodSelection.append('div')
        .attr('id', `method-selection-container-${parameterCode}`)
        .attr('class', 'method-selection-row')
        .text('Sampling Method:');
};