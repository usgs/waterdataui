import {select} from 'd3-selection';

import {drawTimeSpanControls} from './time-span-controls';
import {drawDownloadForm} from './download-data';

/*
 * Helper function to render a select action button on listContainer
 */
const appendButton = function(listContainer, {faIcon, buttonLabel, idOfDivToControl}) {
    const button = listContainer.append('li')
        .attr('class', 'usa-button-group__item')
        .append('button')
            .attr('class', 'usa-button')
            .attr('role', 'checkbox')
            .attr('aria-expanded', false)
            .attr('aria-controls', idOfDivToControl)
            .attr('ga-on', 'click')
            .attr('ga-event-category', 'select-action')
            .attr('ga-event-action', `${idOfDivToControl}-toggle`)
            .on('click', function() {
                const thisButton = select(this);
                const wasSelected = thisButton.attr('aria-expanded') === 'true';

                // If this button was not selected, we need to unselect the button (if any)
                if (!wasSelected) {
                    const selectedButton = listContainer.select('.selected-action');
                    selectedButton.dispatch('click');
                }

                const actionContainer = select(`#${idOfDivToControl}`);
                thisButton
                    .classed('selected-action', !wasSelected)
                    .attr('aria-expanded', !wasSelected);
                actionContainer.attr('hidden', wasSelected ? true : null);

            });
    if (faIcon) {
        button.append('i')
            .attr('class', `fas ${faIcon}`)
            .attr('aria-hidden', true)
            .attr('role', 'img');
    }
    button.append('span').html(buttonLabel);
    return button;
};

/*
 * Render the select action element on container. The store and siteno are needed to render the action forms within
 * the select action element.
 * @param {D3 selection} container
 * @param {Redux store} store
 * @param {String} siteno
 */
export const drawSelectActions = function(container, store, siteno) {
    const state = store.getState();
    const listContainer = container.append('ul')
        .attr('class', 'select-actions-button-group usa-button-group');
    appendButton(listContainer, {
        buttonLabel: 'Change time span',
        idOfDivToControl: 'change-time-span-container'
    });
    appendButton(listContainer, {
        faIcon: 'fa-file-download',
        buttonLabel: 'Download data',
        idOfDivToControl: 'download-graph-data-container'
    });

    container.append('div')
        .attr('id', 'change-time-span-container')
        .attr('hidden', true)
        .call(drawTimeSpanControls, store, siteno);
    container.append('div')
        .attr('id', 'download-graph-data-container')
        .attr('hidden', true)
        .call(drawDownloadForm, store, siteno);
};
