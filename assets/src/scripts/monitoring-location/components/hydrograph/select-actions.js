import {select} from 'd3-selection';

const appendButton = function(listContainer, buttonLabel, idOfDivToControl) {
    return listContainer.append('li')
        .attr('class', 'usa-button-group__item')
        .append('button')
            .attr('class', 'usa-button')
            .attr('aria-expanded', false)
            .attr('aria-controls', idOfDivToControl)
            .attr('ga-on', 'click')
            .attr('ga-event-category', 'select-action')
            .attr('ga-event-action', `${idOfDivToControl}-toggle`)
            .html(buttonLabel)
            .on('click', function() {
                const thisButton = select(this);
                const actionContainer = select(`#${idOfDivToControl}`);
                const isVisible = thisButton.attr('aria-expanded') === 'true';
                select(this)
                    .classed('selected-action', !isVisible)
                    .attr('aria-expanded', !isVisible);
                actionContainer.attr('hidden', isVisible ? true : null);
                // Add code to make sure only one button is active in the button group
                if (!isVisible) {
                    const allButtons = listContainer.selectAll('.usa-button');
                    allButtons.each(function() {
                        const button = select(this);
                        console.log(`Button is ${button.attr('aria-controls')}`);
                        if (button.attr('aria-controls') !== idOfDivToControl && button.attr('aria-expanded') === 'true') {
                            button.dispatch('click');
                        }
                    });
                }
            });
};

export const drawSelectActions = function(container, store) {
    const listContainer = container.append('ul')
        .attr('class', 'usa-button-group');
    appendButton(listContainer, 'Change time span', 'change-time-span-container');
    appendButton(listContainer, 'Download graph data', 'download-graph-data-container');

    container.append('div')
        .attr('id', 'change-time-span-container')
        .attr('hidden', true)
        .append('h3').html('Change time span container'); // Temporary
    container.append('div')
        .attr('id', 'download-graph-data-container')
        .attr('hidden', true)
        .append('h3').html('Download this graph\'s data'); //Temporary
};