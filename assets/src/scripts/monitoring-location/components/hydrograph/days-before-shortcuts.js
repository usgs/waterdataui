
import {link} from 'ui/lib/d3-redux';

import {getSelectedTimeSpan, getInputsForRetrieval} from 'ml/selectors/hydrograph-state-selector';

import {clearGraphBrushOffset, setSelectedTimeSpan} from 'ml/store/hydrograph-state';
import {retrieveHydrographData} from 'ml/store/hydrograph-data';

import {showDataIndicators} from './data-indicator';

const SHORTCUT_BUTTONS = [
    {timeSpan: 'P7D', label: '7 days'},
    {timeSpan: 'P30D', label: '30 days'},
    {timeSpan: 'P365D', label: '1 year'}
];

/*
 * Render a single short cut radio button. Set up the click event handler to update the
 * selectedTimeSpan and fetching the new data. Set up event handler
 * for a change to the selectedTimeSpan in store to update the state of the radio button.
 */
const drawShortcutRadioButton = function(container, store, siteno, {timeSpan, label}) {
    const buttonContainer = container.append('div')
        .attr('class', 'usa-radio');
    buttonContainer.append('input')
        .attr('class', 'usa-radio__input')
        .attr('id', `${timeSpan}-input`)
        .attr('type', 'radio')
        .attr('name', 'time-span')
        .attr('value', timeSpan)
        .on('click', function() {
            if (this.checked) {
                store.dispatch(setSelectedTimeSpan(timeSpan));
                store.dispatch(clearGraphBrushOffset());
                showDataIndicators(true, store);
                store.dispatch(retrieveHydrographData(siteno, getInputsForRetrieval(store.getState())))
                    .then(() => {
                        showDataIndicators(false, store);
                    });

            }
        });
    buttonContainer.append('label')
        .attr('class', 'usa-radio__label')
        .attr('for', `${timeSpan}-input`)
        .text(label);
    buttonContainer.call(link(store, function(thisContainer, selectedTimeSpan) {
        const thisButton = thisContainer.select('input');
        thisButton.property('checked', selectedTimeSpan === thisButton.attr('value'));
    }, getSelectedTimeSpan));
};

/*
 * Render the shortcut days before radio buttons on container. Set up the appropriate event handlers
 * for user actions and for changes to the selectedTimeSpan.
 * @param {D3 selection} container
 * @param {Redux store} store
 * @param {String} siteno
 */
export const drawShortcutDaysBeforeButtons = function(container, store, siteno) {
    const formContainer = container.append('div')
        .attr('class', 'usa-form');
    SHORTCUT_BUTTONS.forEach(shortcut => drawShortcutRadioButton(formContainer, store, siteno, shortcut));
};
