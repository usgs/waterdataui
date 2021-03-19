import {select} from 'd3-selection';

import {drawDateRangeControls} from './date-controls';
import {drawDownloadLinks} from './download-links';
import {getSelectedCustomDateRange, getSelectedDateRange} from '../../selectors/hydrograph-state-selector';

const appendButton = function(listContainer, {faIcon, buttonLabel, idOfDivToControl}) {
    const button = listContainer.append('li')
        .attr('class', 'usa-button-group__item')
        .append('button')
            .attr('class', 'usa-button')
            .attr('aria-expanded', false)
            .attr('aria-controls', idOfDivToControl)
            .attr('ga-on', 'click')
            .attr('ga-event-category', 'select-action')
            .attr('ga-event-action', `${idOfDivToControl}-toggle`)
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
                        if (button.attr('aria-controls') !== idOfDivToControl && button.attr('aria-expanded') === 'true') {
                            button.dispatch('click');
                        }
                    });
                }
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
        buttonLabel: 'Download graph data',
        idOfDivToControl: 'download-graph-data-container'
    });

    container.append('div')
        .attr('id', 'change-time-span-container')
        .attr('hidden', true)
        .call(drawDateRangeControls, store, siteno, getSelectedDateRange(state), getSelectedCustomDateRange(state));
    container.append('div')
        .attr('id', 'download-graph-data-container')
        .attr('hidden', true)
        .call(drawDownloadLinks, store, siteno);
};