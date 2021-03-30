
import {link} from 'ui/lib/d3-redux';

import {getSelectedTimeSpan, getInputsForRetrieval} from 'ml/selectors/hydrograph-state-selector';

import {setSelectedTimeSpan} from 'ml/store/hydrograph-state';
import {retrieveHydrographData} from 'ml/store/hydrograph-data';

import {showDataIndicators} from './data-indicator';

const SHORTCUT_BUTTONS = [
    {timeSpan: 'P7D', label: '7 days'},
    {timeSpan: 'P30D', label: '30 days'},
    {timeSpan: 'P365D', label: '1 year'}
];

const drawShortcutRadioButton = function (container, store, siteno, {timeSpan, label}) {
    const buttonContainer = container.append('div')
        .attr('class', 'usa-radio');
    buttonContainer.append('input')
        .attr('class', 'usa-radio__input')
        .attr('id', `${timeSpan}-input`)
        .attr('type', 'radio')
        .attr('name', 'time-span')
        .attr('value', timeSpan)
        .on('click', function () {
            if (this.checked) {
                store.dispatch(setSelectedTimeSpan(timeSpan));
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
    buttonContainer.call(link(store, function (thisContainer, selectedTimeSpan) {
        const thisButton = thisContainer.select('input');
        thisButton.attr('checked', selectedTimeSpan === thisButton.attr('value') ? true : null);
    }, getSelectedTimeSpan));
};

export const drawShortcutDaysBeforeButtons = function (container, store, siteno) {
    const formContainer = container.append('div')
        .attr('class', 'usa-form');
    SHORTCUT_BUTTONS.forEach(shortcut => drawShortcutRadioButton(formContainer, store, siteno, shortcut));
};
