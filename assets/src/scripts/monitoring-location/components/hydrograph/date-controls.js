import {select} from 'd3-selection';
import {DateTime} from 'luxon';
// required to make the USWDS component JS available to init after page load
import {datePicker, dateRangePicker} from 'uswds-components';

import config from 'ui/config';

import {getInputsForRetrieval} from 'ml/selectors/hydrograph-state-selector';

import {retrieveHydrographData} from 'ml/store/hydrograph-data';
import {clearGraphBrushOffset, setSelectedDateRange, setSelectedCustomDateRange} from 'ml/store/hydrograph-state';

import {getMainLayout} from './selectors/layout';
import {showDataLoadingIndicator} from './data-loading-indicator';

const DATE_RANGE = [{
    name: '7 days',
    period: 'P7D'
}, {
    name: '30 days',
    period: 'P30D'
}, {
    name: '1 year',
    period: 'P365D'
}, {
    name: 'Custom',
    period: 'custom'
}];
const CUSTOM_TIMEFRAME_RADIO_BUTTON_DETAILS = [
    {
        id: 'custom-input-days-before-today',
        value: 'days',
        text: 'Days before today'
    },
    {
        id: 'custom-input-calendar-days',
        value: 'calendar',
        text: 'Calendar days'
    }
];

const isCustomPeriod = function(dateRange) {
    return dateRange !== 'custom' && !DATE_RANGE.find(range => range.period === dateRange);
};
const isCustomDateRange = function(dateRange) {
    return dateRange === 'custom';
};
const showCustomContainer = function(dateRange) {
    return isCustomPeriod(dateRange) || isCustomDateRange(dateRange);
};

/*
 * Set custom form hidden attribute and clear custom container inputs if it is being hidden
 * @param {Boolean} showCustom
 */
const setCustomFormVisibility = function(showCustom) {
    const customContainer = select('#container-radio-group-and-form-buttons');
    customContainer.attr('hidden', showCustom ? null : true);
    // Clear text inputs if form is not visible
    if (!showCustom) {
        customContainer.selectAll('input[type="text"]').property('value', '');
    }
};

/*
 * Render the time range radio buttons
 * @param {D3 container} elem
 * @param {Redux store} store
 * @param {String} siteno
 * @param {String} initialDateRange - used to set the initial selected radio button
 */
const drawSelectRadioButtons = function(elem, store, siteno, initialDateRange) {
    const listContainer = elem.append('ul')
        .attr('class', 'usa-fieldset usa-list--unstyled');

    const li = listContainer.selectAll('li')
        .attr('class', 'usa-fieldset')
        .data(DATE_RANGE)
        .enter().append('li');

    li.append('input')
        .attr('type', 'radio')
        .attr('name', 'ts-daterange-input')
        .attr('id', d => `${d.period}-input`)
        .attr('class', 'usa-radio__input')
        .property('value', d => d.period)
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'TimeSeriesGraph')
        .attr('ga-event-action', d => `changeDateRangeTo${d.period}`)
        .property('checked', d => d.period === initialDateRange || d.period === 'custom' && isCustomPeriod(initialDateRange))
        .on('change', function() {
            const checkedButton = li.select('input:checked');
            const selectedValue = checkedButton.property('value');
            const isCustom = selectedValue === 'custom';
            setCustomFormVisibility(isCustom);
            li.select('#custom-input').attr('aria-expanded', isCustom);
            if (!isCustom) {
                store.dispatch(clearGraphBrushOffset());
                store.dispatch(setSelectedDateRange(selectedValue));
                showDataLoadingIndicator(true, getMainLayout(store.getState()).height);
                store.dispatch(retrieveHydrographData(siteno, getInputsForRetrieval(store.getState())))
                    .then(() => {
                        showDataLoadingIndicator(false);
                    });
            }
        });
    li.select('#custom-input').attr('aria-expanded', isCustomPeriod(initialDateRange));

    li.append('label')
        .attr('class', 'usa-radio__label')
        .attr('for', (d) => `${d.period}-input`)
        .text((d) => d.name);
};

/*
 * Render the radio buttons that select which kind of custom timespan is desired
 * @param {D3 selection} container
 * @param {String} initialDateRange - Used to set the initial radio button selection
 */
const drawCustomRadioButtons = function(container, initialDateRange) {
    const radioButtonContainer = container.append('div')
        .attr('id', 'ts-custom-date-radio-group')
        .attr('role', 'radiogroup')
        .attr('aria-label', 'Custom time interval select');
    radioButtonContainer.append('p').text('Enter timespan using');
    const listContainer = radioButtonContainer.append('ul')
            .attr('class', 'usa-fieldset usa-list--unstyled');
    const radioButtonListItem = listContainer.selectAll('li')
        .attr('class', 'usa-fieldset')
        .data(CUSTOM_TIMEFRAME_RADIO_BUTTON_DETAILS)
        .enter()
        .append('li');

    radioButtonListItem.append('input')
        .attr('type', 'radio')
        .attr('name', 'ts-custom-daterange-input')
        .attr('id', d => `${d.value}-input`)
        .attr('class', 'usa-radio__input')
        .property('value', d => d.value)
        .property('checked', d => d.value === 'calendar' ? initialDateRange === 'custom' : initialDateRange !== 'custom')
        .attr('ga-on', 'click')
        .attr('aria-expanded', d => d.value === 'calendar' ? initialDateRange === 'custom' : initialDateRange !== 'custom')
        .attr('ga-event-category', 'TimeSeriesGraph')
        .attr('ga-event-action', d => `changeDateRangeWith${d.value}`)
        .on('change', function(_, d) {
            container.select('#days-input').attr('aria-expanded', d.value === 'days');
            container.select('#calendar-input').attr('aria-expanded', d.value === 'calendar');
            container.select('#ts-custom-days-before-today-select-container')
                .attr('hidden', d.value === 'days' ? null : true);
            container.select('#ts-customdaterange-select-container')
                .attr('hidden', d.value === 'calendar' ? null : true);
        });
        radioButtonListItem.append('label')
            .attr('class', 'usa-radio__label')
            .attr('for', (d) => `${d.value}-input`)
            .text((d) => d.text);
};

/*
 * Render the custom "days before today" container
 * @param {D3 selection} container
 * @param {Redux store} store
 * @param {String} siteno
 * @param {String} initialDateRange - Used to set the initial contents of the text field.
 */
const drawCustomDaysBeforeForm = function(container, store, siteno, initialDateRange) {
    const formContainer = container.append('div')
        .attr('id', 'ts-custom-days-before-today-select-container')
        .attr('class', 'usa-form')
        .attr('aria-label', 'Custom date by days before today specification')
        .attr('hidden', initialDateRange === 'custom' ? true : null);

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
                showDataLoadingIndicator(true, getMainLayout(store.getState()).height);
                store.dispatch(retrieveHydrographData(siteno, getInputsForRetrieval(store.getState())))
                    .then(() => {
                        showDataLoadingIndicator(false);
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
 * Render the custom calendar days form
 * @param {D3 selection} container
 * @param {Redux store} store
 * @param {String} siteno
 * @param {String} initialDateRange - if 'custom' then this container is made visible
 * @param {Object} initialCustomDateRange - has start and end String properties containing an ISO 8601 date string
 *      and is used to set the initial values of the calendar pickers
 */
const drawCustomCalendarDaysForm = function(container, store, siteno, initialDateRange, initialCustomDateRange) {
    const calendarDaysContainer = container.append('div')
        .attr('id', 'ts-customdaterange-select-container')
        .attr('role', 'customdate')
        .attr('class', 'usa-form')
        .attr('aria-label', 'Custom date specification')
        .attr('hidden', initialDateRange === 'custom' ? null : true);

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
                    showDataLoadingIndicator(true, getMainLayout(store.getState()).height);
                    store.dispatch(retrieveHydrographData(siteno, getInputsForRetrieval(store.getState())))
                        .then(() => {
                            showDataLoadingIndicator(false);
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
