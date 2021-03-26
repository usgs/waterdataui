import {select} from 'd3-selection';
import {DateTime} from 'luxon';
// required to make the USWDS component JS available to init after page load
import {datePicker, dateRangePicker} from 'uswds-components';

import config from 'ui/config';

import {drawErrorAlert} from 'd3render/alerts';

import {getInputsForRetrieval, getSelectedTimeSpan} from 'ml/selectors/hydrograph-state-selector';

import {retrieveHydrographData} from 'ml/store/hydrograph-data';
import {clearGraphBrushOffset, setSelectedTimeSpan} from 'ml/store/hydrograph-state';

import {showDataIndicators} from './data-indicator';

const isISODuration = function(timeSpan) {
    return typeof timeSpan === 'string';
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
        .attr('class', 'usa-date-picker')
        .attr('data-min-date', '1900-01-01')
        .attr('data-max-date', DateTime.now().toISODate())
        .attr('data-default-value', initialDate ? initialDate : '')
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
    container.append('div')
        .attr('class', 'usa-date-range-picker')
        .call(drawDatePicker, 'start-date', 'Start date', hasInitialDateRange ? initialTimeSpan.start : '')
        .call(drawDatePicker, 'end-date', 'End date', hasInitialDateRange ? initialTimeSpan.end : '');

    // required to init the USWDS date picker after page load before calling the dateRangePicker on function
    datePicker.init(container.node());
    // required to init the USWDS date range picker after page load
    dateRangePicker.on(container.node());
};

/*
 * Render the days before today form
 * @param {D3 selection} container
 * @param {Redux store} store
 */
const drawDaysBeforeTodayForm = function(container, store) {
    const initialTimeSpan = getSelectedTimeSpan(store.getState());
    const hasDaysBeforeToday = isISODuration(initialTimeSpan);

    const daysContainer = container.append('div')
        .attr('class', 'days-before-container');
    daysContainer.append('label')
        .attr('class', 'usa-label')
        .attr('for', 'days-before-today')
        .text('Days before today: ');
    daysContainer.append('input')
        .attr('class', 'usa-input')
        .attr('id', 'days-before-today')
        .attr('name', 'days-before-today')
        .attr('type', 'text')
        .attr('value', hasDaysBeforeToday ? initialTimeSpan.slice(1, -1) : '')
        .attr('maxlength', 5);
};

/*
 * Retrieve the time span inputs from the form, validate the data and if valid
 * dispatch actions to the store to update the retrieved data
 * @param {D3 selection} container
 * @param {Redux store} store
 * @param {String} siteno
 */
const updateSelectedTimeSpan = function(container, store, siteno) {
    const startDateStr = select('#start-date').property('value');
    const endDateStr = select('#end-date').property('value');
    const daysBeforeToday = select('#days-before-today').property('value');
    // Remove old error messages
    container.call(drawErrorAlert, {});

    let newTimeSpan;

    if (!startDateStr && !endDateStr && !daysBeforeToday) {
        container.select('.time-span-input-container')
            .call(drawErrorAlert, {
                body: 'Please enter either a date range or days before today',
                useSlim: true
            });
    } else if (startDateStr || endDateStr) {
        //Validate start and end dates
        const startDate = DateTime.fromFormat(startDateStr, 'LL/dd/yyyy', {zone: config.locationTimeZone});
        const endDate = DateTime.fromFormat(endDateStr, 'LL/dd/yyyy', {zone: config.locationTimeZone});
        let dateRangeError;
        if (!startDate.isValid && !endDate.isValid) {
            dateRangeError = 'Please enter valid start and end dates';
        } else if (!startDate.isValid) {
            dateRangeError = 'Please enter a valid start date';
        } else if (!endDate.isValid) {
            dateRangeError = 'Please enter a valid end date';
        } else if (startDate > endDate) {
            dateRangeError = 'Please enter a start date that is before the end date';
        }
        if (dateRangeError) {
            container.select('.date-range-container')
                .call(drawErrorAlert, {
                    body: dateRangeError,
                    useSlim: true
                });
        } else {
            newTimeSpan = {
                start: startDate.toISODate(),
                end: endDate.toISODate()
            };
        }
    } else {
        const integerDays = parseInt(daysBeforeToday);
        if (isNaN(integerDays) || integerDays < 1) {
            container.select('.days-before-today-container')
                .call(drawErrorAlert, {
                    body: 'Please enter a positive number of days',
                    useSlim: true
                });
        } else {
            newTimeSpan = `P${daysBeforeToday}D`;
        }
    }

    if (newTimeSpan) {
        showDataIndicators(true, store);
        store.dispatch(clearGraphBrushOffset());
        store.dispatch(setSelectedTimeSpan(newTimeSpan));
        store.dispatch(retrieveHydrographData(siteno, getInputsForRetrieval(store.getState())))
            .then(() => {
                showDataIndicators(false, store);
            });
    }
};

/*
 * Draw the time span control form on container, set up the appropriate event
 * handlers and initialized the forms control from data in store.
 * @param {D3 selection} container
 * @param {Redux store} store
 * @param {String} siteno
 */
export const drawTimeSpanControls = function(container, store, siteno) {
    const inputContainer = container.append('div')
        .attr('class', 'time-span-input-container');
    inputContainer.append('div')
        .attr('class', 'date-range-container')
        .call(drawDateRangeForm, store);
    inputContainer.append('div')
        .text('Or');
    inputContainer.append('div')
        .attr('class', 'days-before-today-container')
        .call(drawDaysBeforeTodayForm, store);
    container.append('button')
        .attr('class', 'usa-button')
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'TimeSeriesGraph')
        .attr('ga-event-action', 'timeSpanChange')
        .text('Change time span')
        .on('click', function() {
            container.call(updateSelectedTimeSpan, store, siteno);
        });
};
