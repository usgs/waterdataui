import {select} from 'd3-selection';
import {DateTime} from 'luxon';
// required to make the USWDS component JS available to init after page load
import {datePicker, dateRangePicker} from 'uswds-components';

import config from 'ui/config';

import {getInputsForRetrieval} from 'ml/selectors/hydrograph-state-selector';

import {retrieveHydrographData} from 'ml/store/hydrograph-data';
import {clearGraphBrushOffset, setSelectedDateRange, setSelectedCustomDateRange} from 'ml/store/hydrograph-state';

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
const drawDatePicker = function(container, id, label, initialDate) {
    container.append('label')
        .attr('class', 'usa-label')
        .attr('id', `${id}-label`)
        .attr('for', id)
        .text(label);

    container.append('div')
        .attr('class', 'usa-hint')
        .attr('id', `${id}-hint`)
        .text('mm/dd/yyyy')
        .append('div')
            .attr('class', 'usa-date-picker')
            .attr('data-default-value', initialDate)
            .attr('data-min-date', '1900-01-01')
            .attr('data-max-date', '2100-12-31')
            .append('input')
                .attr('class', 'usa-input')
                .attr('type', 'text')
                .attr('id', id)
                .attr('name', id)
                .attr('aria-describedby', `${id}-label ${id}-hint`)
                .attr('type', 'text');
};

/*
 * Render the date range picker
 * @param {D3 selection} container
 * @param {Redux store} store
 * @param {String} siteno
 * @param {String} initialDateRange - if 'custom' then this container is made visible
 * @param {Object} initialCustomDateRange - has start and end String properties containing an ISO 8601 date string
 *      and is used to set the initial values of the calendar pickers
 */
const drawDateRangeForm = function(container, store, siteno) {
    const calendarDaysContainer = container.append('div')
        .attr('id', 'ts-customdaterange-select-container')
        .attr('role', 'customdate')
        .attr('class', 'usa-form')
        .attr('aria-label', 'Custom date specification')
        .attr('hidden', !isCustomPeriod(initialDateRange) ? null : true);
    
    const dateRangePickerContainer = calendarDaysContainer.append('div')
        .attr('class', 'usa-date-range-picker');
    dateRangePickerContainer.append('div')
        .attr('id', 'start-date-form-group')
        .attr('class', 'usa-form-group')
        .call(drawDatePicker, 'custom-start-date', 'Start Date', initialCustomDateRange ? initialCustomDateRange.start : '');
    dateRangePickerContainer.append('div')
        .attr('id', 'end-date-form-group')
        .attr('class', 'usa-form-group')
        .call(drawDatePicker, 'custom-end-date', 'End Date', initialCustomDateRange ? initialCustomDateRange.end : '');

    const calendarDaysValidationContainer = calendarDaysContainer.append('div')
        .attr('class', 'usa-alert usa-alert--warning usa-alert--validation')
        .attr('id', 'custom-date-alert-container')
        .attr('hidden', true);
    const dateAlertBody = calendarDaysValidationContainer.append('div')
        .attr('class', 'usa-alert__body')
        .attr('id', 'custom-date-alert');
    dateAlertBody.append('h3')
        .attr('class', 'usa-alert__heading')
        .text('Date requirements');

    // required to init the USWDS date picker after page load before calling the
    // dateRangePicker on function
    datePicker.init(dateRangePickerContainer.node());
    // required to init the USWDS date range picker after page load
    dateRangePicker.on(dateRangePickerContainer.node());

    // Adds controls for the calendar day submit button
    const calendarDaysSubmitContainer = calendarDaysContainer.append('div')
        .attr('class', 'submit-button');
    calendarDaysSubmitContainer.append('button')
        .attr('class', 'usa-button')
        .attr('id', 'custom-date-submit-calendar')
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'TimeSeriesGraph')
        .attr('ga-event-action', 'customDateSubmit')
        .text('Display data on graph')
        .on('click', function() {
            const startDateStr = calendarDaysContainer.select('#custom-start-date').property('value');
            const endDateStr = calendarDaysContainer.select('#custom-end-date').property('value');
            if (startDateStr.length === 0 || endDateStr.length === 0) {
                dateAlertBody.selectAll('p').remove();
                dateAlertBody.append('p')
                    .text('Both start and end dates must be specified.');
                calendarDaysValidationContainer.attr('hidden', null);
            } else {
                const startTime = DateTime.fromFormat(startDateStr, 'LL/dd/yyyy', {zone: config.locationTimeZone}).toMillis();
                const endTime = DateTime.fromFormat(endDateStr, 'LL/dd/yyyy', {zone: config.locationTimeZone}).toMillis();
                if (startTime > endTime) {
                    dateAlertBody.selectAll('p').remove();
                    dateAlertBody.append('p')
                        .text('The start date must precede the end date.');
                    calendarDaysValidationContainer.attr('hidden', null);
                } else {
                    calendarDaysValidationContainer.attr('hidden', true);
                    store.dispatch(clearGraphBrushOffset());
                    store.dispatch(setSelectedCustomDateRange(DateTime.fromMillis(startTime, {zone: config.locationTimeZone}).toISODate(),
                        DateTime.fromMillis(endTime, {zone: config.locationTimeZone}).toISODate()));
                    store.dispatch(setSelectedDateRange('custom'));
                    showDataIndicators(true, store);
                    store.dispatch(retrieveHydrographData(siteno, getInputsForRetrieval(store.getState())))
                        .then(() => {
                            showDataIndicators(false, store);
                        });
                }
            }
        });
};

/*
 * Renders the date controls used to set the time range. This can be done by using short cut selections or by
 * using the custom date range form.
 * @param {D3 selection} elem
 * @param {Redux store} store
 * @param {String} siteno
 * @param {String} initialDateRange
 * @param {Object} initialCustomDateRange - has string start and end components containing an ISO 8601 date string
 */
export const drawDateRangeControls = function(elem, store, siteno, initialDateRange, initialCustomDateRange) {
    // Add a container that holds the custom selection radio buttons and the form fields
    elem.append('div')
        .attr('id', 'ts-daterange-select-container')
        .attr('role', 'radiogroup')
        .attr('aria-label', 'Time interval select')
        .call(drawSelectRadioButtons, store, siteno, initialDateRange);
    elem.append('div')
        .attr('id', 'container-radio-group-and-form-buttons')
        .call(drawCustomRadioButtons, initialDateRange)
        .call(drawCustomDaysBeforeForm, store, siteno, initialDateRange)
        .call(drawCustomCalendarDaysForm, store, siteno, initialDateRange, initialCustomDateRange);
    setCustomFormVisibility(showCustomContainer(initialDateRange));
};

export const drawTimeSpanControl = function(container, store, siteno) {

};
