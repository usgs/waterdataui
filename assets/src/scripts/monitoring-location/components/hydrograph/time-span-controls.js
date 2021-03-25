import {select} from 'd3-selection';
import {DateTime} from 'luxon';
// required to make the USWDS component JS available to init after page load
import {datePicker, dateRangePicker} from 'uswds-components';

import config from 'ui/config';

import {getInputsForRetrieval, getSelectedTimeSpan} from 'ml/selectors/hydrograph-state-selector';

import {retrieveHydrographData} from 'ml/store/hydrograph-data';
import {clearGraphBrushOffset, setSelectedTimeSpan} from 'ml/store/hydrograph-state';

import {showDataIndicators} from './data-indicator';

const isISODuration = function(timeSpan) {
    return typeof timeSpan === 'string';
};

/*
 * Render the custom "days before today" container
 * @param {D3 selection} container
 * @param {Redux store} store
 * @param {String} siteno
 * @param {String} initialDateRange - Either in the form of P<some number>P(or Y). Used to set the initial contents of the text field.
 */
const drawCustomDaysBeforeForm = function(container, store, siteno, initialDateRange) {
    const formContainer = container.append('div')
        .attr('id', 'ts-custom-days-before-today-select-container')
        .attr('class', 'usa-form')
        .attr('aria-label', 'Custom date by days before today specification')
        .attr('hidden', !isCustomPeriod(initialDateRange) ? true : null);

    const daysBeforeContainer = formContainer.append('div')
            .attr('class', 'usa-character-count')
            .append('div')
            .attr('class', 'usa-form-group');
    daysBeforeContainer.append('label')
        .attr('class', 'usa-label')
        .attr('for', 'with-hint-input-days-from-today' )
        .text('Days');
    daysBeforeContainer.append('span')
        .attr('id', 'with-hint-input-days-from-today-hint')
        .attr('class', 'usa-hint')
        .text('Timespan in days before today');
    daysBeforeContainer.append('input')
        .attr('class', 'usa-input usa-character-count__field')
        .attr('type', 'text')
        .attr('id', 'with-hint-input-days-from-today')
        .attr('maxlength', `${config.MAX_DIGITS_FOR_DAYS_FROM_TODAY}`)
        .attr('name', 'with-hint-input-days-from-today')
        .property('value', isCustomPeriod(initialDateRange) ? initialDateRange.slice(1, -1) : '')
        .attr('aria-describedby', 'with-hint-input-days-from-today-info with-hint-input-days-from-today-hint');

    daysBeforeContainer.append('span')
        .text(`${config.MAX_DIGITS_FOR_DAYS_FROM_TODAY} digits allowed`)
        .attr('id', 'with-hint-input-days-from-today-info')
        .attr('class', 'usa-hint usa-character-count__message')
        .attr('aria-live', 'polite');
    // Create a validation alert for user selection of number of days before today
    const daysBeforeValidationContainer = daysBeforeContainer.append('div')
        .attr('class', 'usa-alert usa-alert--warning usa-alert--validation')
        .attr('id', 'custom-days-before-today-alert-container')
        .attr('hidden', true);
    const daysBeforeAlertBody = daysBeforeValidationContainer.append('div')
        .attr('class', 'usa-alert__body')
        .attr('id', 'custom-days-before-today-alert');
    daysBeforeAlertBody.append('h3')
        .attr('class', 'usa-alert__heading')
        .text('Requirements');

    // Adds controls for the 'days before today' submit button
    const daysBeforeSubmitContainer = daysBeforeContainer.append('div')
        .attr('class', 'submit-button');
    daysBeforeSubmitContainer.append('button')
        .attr('class', 'usa-button')
        .attr('id', 'custom-date-submit-days')
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'TimeSeriesGraph')
        .attr('ga-event-action', 'customDaysSubmit')
        .text('Display data on graph')
        .on('click', function() {
            const daysBefore = daysBeforeContainer.select('#with-hint-input-days-from-today').property('value');
            // Validate user input for things not a number and blank entries
            if (isNaN(daysBefore) || daysBefore.length === 0) {
                daysBeforeAlertBody.selectAll('p').remove();
                daysBeforeAlertBody.append('p')
                    .text('Entry must be a number.');
                daysBeforeValidationContainer.attr('hidden', null);
            } else {
                daysBeforeValidationContainer.attr('hidden', true);
                store.dispatch(clearGraphBrushOffset());
                store.dispatch(setSelectedDateRange(`P${parseInt(daysBefore)}D`));
                showDataIndicators(true, store);
                store.dispatch(retrieveHydrographData(siteno, getInputsForRetrieval(store.getState())))
                    .then(() => {
                        showDataIndicators(false, store);
                    });
            }
        });
};

/*
 * Render a USWDS date picker markup
 * @param {D3 selection} container
 * @param {String} id - id for the date picker
 * @param {String} label - label for the date picker
 * @param {String} initialDate - ISO 8601 Date format
 */
const drawDatePicker = function(container, id, ariaLabel, initialDate) {
    const formGroup = container.append('div')
        .attr('class', 'usa-form-group');
    formGroup.append('div')
        .attr('class', 'usa-hint')
        .attr('id', `${id}-hint`)
        .text('mm/dd/yyyy');
    formGroup.append('div')
        .attr('class', 'usa-date-picker time-span-date-range-picker')
        .attr('data-default-value', initialDate ? initialDate : null)
        .append('input')
            .attr('class', 'usa-input')
            .attr('type', 'text')
            .attr('maxlength', 10)
            .attr('size', 10)
            .attr('id', id)
            .attr('name', id)
            .attr('aria-label', ariaLabel)
            .attr('aria-describedby', `${id}-hint`);
};

/*
 * Render the date range picker
 * @param {D3 selection} container
 * @param {Redux store} store
 * @param {String} siteno
 */
const drawDateRangeForm = function(container, store) {
    const initialTimeSpan = getSelectedTimeSpan(store.getState());
    const hasInitialDateRange = !isISODuration(initialTimeSpan);
    container.append('span')
        .text('Date range:');
    const dateRangePickerContainer = container.append('div')
        .attr('class', 'usa-date-range-picker')
        .call(drawDatePicker, 'start-date', 'Start date', hasInitialDateRange ? initialTimeSpan.start : '');
    dateRangePickerContainer.append('span').text('to');
    dateRangePickerContainer.call(drawDatePicker, 'end-date', 'End date', hasInitialDateRange ? initialTimeSpan.end : '');

    // required to init the USWDS date picker after page load before calling the
    // dateRangePicker on function
    datePicker.init(dateRangePickerContainer.node());
    // required to init the USWDS date range picker after page load
    dateRangePicker.on(dateRangePickerContainer.node());
};

export const drawTimeSpanControls = function(container, store, siteno) {
    container.append('div')
        .attr('class', 'date-range-container')
        .call(drawDateRangeForm, store);
};
