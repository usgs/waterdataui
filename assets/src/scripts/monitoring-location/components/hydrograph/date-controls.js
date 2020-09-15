import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import {link} from '../../../lib/d3-redux';
import {drawLoadingIndicator} from '../../../d3-rendering/loading-indicator';

// required to make the USWDS component JS available to init after page load
import components from '../../../../../node_modules/uswds/src/js/components';

import {
    isLoadingTS,
    hasAnyTimeSeries,
    getCurrentDateRangeKind,
    getCurrentDateRangeKindCustomSelection,
    getCustomTimeRange} from '../../selectors/time-series-selector';
import {getIanaTimeZone} from '../../selectors/time-zone-selector';
import {Actions as ivTimeSeriesDataActions} from '../../store/instantaneous-value-time-series-data';
import {Actions as ivTimeSeriesStateActions} from '../../store/instantaneous-value-time-series-state';

export const drawDateRangeControls = function(elem, store, siteno) {
    const MAX_NUMBER_OF_DAYS_USERS_CAN_INPUT = 5;
    const DATE_RANGE = [{
        name: '7 days',
        period: 'P7D'
    }, {
        name: '30 days',
        period: 'P30D'
    }, {
        name: '1 year',
        period: 'P1Y'
    }, {
        name: 'Custom',
        period: 'custom',
        ariaExpanded: false
    }];
    const CUSTOM_TIMEFRAME_RADIO_BUTTON_DETAILS = [
        {
            id: 'custom-input-days-before-today',
            value: 'Days',
            text: 'days before today',
            ariaExpanded: true
        },
        {
            id: 'custom-input-calender-days',
            value: 'Calender',
            text: 'calender days',
            ariaExpanded: false
        }
    ];

    const containerRadioGroupMainSelectButtons = elem.insert('div', ':nth-child(2)')
        .attr('id', 'ts-daterange-select-container')
        .attr('role', 'radiogroup')
        .attr('aria-label', 'Time interval select')
        .call(link(store,function(container, showControls) {
            container.attr('hidden', showControls ? null : true);
        }, hasAnyTimeSeries));

    const containerRadioGroupCustomSelectButtons = elem.insert('div', ':nth-child(3)')
        .attr('id', 'ts-custom-date-radio-group')
        .attr('role', 'radiogroup')
        .attr('aria-label', 'Custom time interval select')
        .call(link(store, (container, dateRangeKind) => {
            container.attr('hidden', dateRangeKind === 'custom' ? null : true);

        }, getCurrentDateRangeKind));

    const containerCustomDaysBeforeToday = elem.insert('div', ':nth-child(4)')
        .attr('id', 'ts-custom-days-before-today-select-container')
        .attr('class', 'usa-form')
        .attr('aria-label', 'Custom date by days before today specification')
        .call(link(store, (container, dateRangeKind) => {
            console.log('container ', container)
            console.log('days before dateRangeKind', dateRangeKind)

        }, getCurrentDateRangeKind));

    const containerCustomCalenderDays = elem.insert('div', ':nth-child(5)')
        .attr('id', 'ts-customdaterange-select-container')
        .attr('role', 'customdate')
        .attr('class', 'usa-form')
        .attr('aria-label', 'Custom date specification')
        .call(link(store, (container, dateRangeKind) => {
            console.log('calender dateRangeKind', dateRangeKind)

            container.attr('hidden', dateRangeKind === 'custom' ? null : true);
        }, getCurrentDateRangeKind, getCurrentDateRangeKindCustomSelection));

   // Add radio buttons for 'days from today' and 'calendar days' selections
    const listContainerForCustomSelectRadioButtons = containerRadioGroupCustomSelectButtons.append('ul')
        .attr('class', 'usa-fieldset usa-list--unstyled');
    const listItemForCustomSelectRadioButtons  = listContainerForCustomSelectRadioButtons.selectAll('li')
        .attr('class', 'usa-fieldset')
        .data(CUSTOM_TIMEFRAME_RADIO_BUTTON_DETAILS)
        .enter()
        .append('li');
    listItemForCustomSelectRadioButtons.append('input')
        .attr('type', 'radio')
        .attr('name', 'ts-custom-daterange-input')
        .attr('id', d => `${d.value}-input`)
        .attr('class', 'usa-radio__input')
        .attr('value', d => d.value)
        .attr('ga-on', 'click')
        .attr('aria-expanded', d => d.ariaExpanded)
        .attr('ga-event-category', 'TimeSeriesGraph')
        .attr('ga-event-action', d => `changeDateRangeWith${d.value}`)
        .on('change', function() {
            const selected = listItemForCustomSelectRadioButtons.select('input:checked');
            const selectedVal = selected.attr('value');
            if (selectedVal === 'Days') {
                containerCustomDaysBeforeToday.attr('hidden', null);
                containerCustomCalenderDays.attr('hidden', true);
            } else if (selectedVal === 'Calender') {
                containerCustomDaysBeforeToday.attr('hidden', true);
                containerCustomCalenderDays.attr('hidden', null);
            } else {
                console.log('there was an error in the custom timeframe selection');
            }
        });

    listItemForCustomSelectRadioButtons.append('label')
        .attr('class', 'usa-radio__label')
        .attr('for', (d) => `${d.value}-input`)
        .text((d) => d.text);
    listItemForCustomSelectRadioButtons.call(link(store, (elem, dateRangeKindCustomSelection) => {
        console.log('element selected ', elem.select(`#${dateRangeKindCustomSelection}-input`).property('checked', true));
        console.log('select item call dateRangeKindCustomSelection ', dateRangeKindCustomSelection)
        elem.select(`#${dateRangeKindCustomSelection}-input`).property('checked', true);
    }, getCurrentDateRangeKindCustomSelection));

    // Add controls for selecting time in days from today
    const numberOfDaysSelection = containerCustomDaysBeforeToday.append('div')
        .attr('class', 'usa-character-count')
        .append('div')
        .attr('class', 'usa-form-group');
    numberOfDaysSelection.append('label')
        .attr('class', 'usa-label')
        .attr('for', 'with-hint-input-days-from-today' )
        .text('Days');
    numberOfDaysSelection.append('span')
        .attr('id', 'with-hint-input-days-from-today-hint')
        .attr('class', 'usa-hint')
        .text('timespan in days before today');
    numberOfDaysSelection.append('input')
        .attr('class', 'usa-input usa-character-count__field')
        .attr('id', 'with-hint-input-days-from-today')
        .attr('maxlength', `${MAX_NUMBER_OF_DAYS_USERS_CAN_INPUT}`)
        .attr('name', 'with-hint-input-days-from-today')
        .attr('aria-describedby', 'with-hint-input-days-from-today-info with-hint-input-days-from-today-hint');
    numberOfDaysSelection.append('span')
        .text(`${MAX_NUMBER_OF_DAYS_USERS_CAN_INPUT} digits allowed`)
        .attr('id', 'with-hint-input-days-from-today-info')
        .attr('class', 'usa-hint usa-character-count__message')
        .attr('aria-live', 'polite');
    // Create a validation alert for user selection of number of days before today
    const customDaysBeforeTodayValidationContainer = containerCustomDaysBeforeToday.append('div')
        .attr('class', 'usa-alert usa-alert--warning usa-alert--validation')
        .attr('id', 'custom-date-alert-container')
        .attr('hidden', true);
    const customDaysBeforeTodayAlertBody = customDaysBeforeTodayValidationContainer.append('div')
        .attr('class', 'usa-alert__body')
        .attr('id', 'custom-days-before-today-alert');
    customDaysBeforeTodayAlertBody.append('h3')
        .attr('class', 'usa-alert__heading')
        .text('Requirements');

    // Adds controls for the days before today submit button
    const daysBeforeTodaySubmitContainer = containerCustomDaysBeforeToday.append('div')
        .attr('class', 'submit-button');

    daysBeforeTodaySubmitContainer.append('button')
        .attr('class', 'usa-button')
        .attr('id', 'custom-date-submit-days')
        .text('Submit')
        .on('click', function() {
            const userSpecifiedNumberOfDays = document.getElementById('with-hint-input-days-from-today').value;
            const formattedPeriodQueryParameter = `P${parseInt(userSpecifiedNumberOfDays)}D`;
            // Validate user input for things not a number and blank entries
            if (isNaN(userSpecifiedNumberOfDays) || userSpecifiedNumberOfDays.length === 0) {
                customDaysBeforeTodayAlertBody.selectAll('p').remove();
                customDaysBeforeTodayAlertBody.append('p')
                    .text('Entry must be a number.');
                customDaysBeforeTodayValidationContainer.attr('hidden', null);
            } else {
                customDaysBeforeTodayValidationContainer.attr('hidden', true);
                const  dateRangeKindCustomSelection = 'Days';
                store.dispatch(ivTimeSeriesDataActions.retrieveExtendedIVTimeSeriesCustomSelectionPeriod(
                    siteno,
                    formattedPeriodQueryParameter,
                    dateRangeKindCustomSelection
                )).then(() => store.dispatch(ivTimeSeriesStateActions.clearIVGraphBrushOffset()));
                console.log('this is the query parameter ', formattedPeriodQueryParameter);
            }
        });

    // Adds controls for the date picker
    const dateRangePicker = containerCustomCalenderDays.append('div')
        .attr('class', 'usa-date-range-picker');

    const customDateValidationContainer = containerCustomCalenderDays.append('div')
        .attr('class', 'usa-alert usa-alert--warning usa-alert--validation')
        .attr('id', 'custom-date-alert-container')
        .attr('hidden', true);

    const dateAlertBody = customDateValidationContainer.append('div')
        .attr('class', 'usa-alert__body')
        .attr('id', 'custom-date-alert');

    dateAlertBody.append('h3')
        .attr('class', 'usa-alert__heading')
        .text('Date requirements');

    const startDateFormGroup = dateRangePicker.append('div')
        .attr('id', 'start-date-form-group')
        .attr('class', 'usa-form-group');

    const endDateFormGroup = dateRangePicker.append('div')
        .attr('id', 'end-date-form-group')
        .attr('class', 'usa-form-group');

    startDateFormGroup.append('label')
        .attr('class', 'usa-label')
        .attr('id', 'custom-start-date-label')
        .attr('for', 'custom-start-date')
        .text('Start Date');

    startDateFormGroup.append('div')
        .attr('class', 'usa-hint')
        .attr('id', 'custom-start-date-hint')
        .text('mm/dd/yyyy')
        .append('div')
            .attr('class', 'usa-date-picker')
            .attr('data-min-date', '1900-01-01')
            .attr('data-max-date', '2100-12-31')
            .append('input')
                .attr('class', 'usa-input')
                .attr('id', 'custom-start-date')
                .attr('name', 'custom-start-date')
                .attr('aria-describedby', 'custom-start-date-label custom-start-date-hint')
                .attr('type', 'text');

    endDateFormGroup.append('label')
        .attr('class', 'usa-label')
        .attr('id', 'custom-end-date-label')
        .attr('for', 'custom-end-date')
        .text('End Date');

    endDateFormGroup.append('div')
        .attr('class', 'usa-hint')
        .attr('id', 'custom-end-date-hint')
        .text('mm/dd/yyyy')
        .append('div')
            .attr('class', 'usa-date-picker')
            .attr('data-min-date', '1900-01-01')
            .attr('data-max-date', '2100-12-31')
            .append('input')
                .attr('class', 'usa-input')
                .attr('id', 'custom-end-date')
                .attr('name', 'custom-end-date')
                .attr('type', 'text')
                .attr('aria-describedby', 'custom-end-date-label custom-end-date-hint');

    // required to init the USWDS date picker after page load
    components.datePicker.init(elem.node());
    // required to init the USWDS date range picker after page load
    components.dateRangePicker.init(elem.node());

    // Adds controls for the calender day submit button
    const calenderDaysSubmitContainer = containerCustomCalenderDays.append('div')
        .attr('class', 'submit-button');

    calenderDaysSubmitContainer.append('button')
        .attr('class', 'usa-button')
        .attr('id', 'custom-date-submit-calender')
        .text('Submit')
        .on('click', function() {
            let userSpecifiedStart = document.getElementById('custom-start-date').value;
            let userSpecifiedEnd = document.getElementById('custom-end-date').value;
            if (userSpecifiedStart.length === 0 || userSpecifiedEnd.length === 0) {
                dateAlertBody.selectAll('p').remove();
                dateAlertBody.append('p')
                    .text('Both start and end dates must be specified.');
                customDateValidationContainer.attr('hidden', null);
            } else if (DateTime.fromFormat(userSpecifiedEnd, 'LL/dd/yyyy') < DateTime.fromFormat(userSpecifiedStart, 'LL/dd/yyyy')) {
                dateAlertBody.selectAll('p').remove();
                dateAlertBody.append('p')
                    .text('The start date must precede the end date.');
                customDateValidationContainer.attr('hidden', null);
            } else {
                customDateValidationContainer.attr('hidden', true);
                userSpecifiedStart = DateTime.fromFormat(userSpecifiedStart, 'LL/dd/yyyy').toISODate();
                userSpecifiedEnd = DateTime.fromFormat(userSpecifiedEnd, 'LL/dd/yyyy').toISODate();
                store.dispatch(ivTimeSeriesDataActions.retrieveUserRequestedIVDataForDateRange(
                    siteno,
                    userSpecifiedStart,
                    userSpecifiedEnd
                )).then(() => store.dispatch(ivTimeSeriesStateActions.clearIVGraphBrushOffset()));
            }
        });


    containerCustomCalenderDays.call(link(store, (container, {customTimeRange, ianaTimeZone}) => {
        container.select('#custom-start-date')
            .property('value', customTimeRange && customTimeRange.start ? DateTime.fromMillis(customTimeRange.start, {zone: ianaTimeZone}).startOf('day').toFormat('LL/dd/yyyy') : '');
        container.select('#custom-end-date')
            .property('value', customTimeRange && customTimeRange.end ? DateTime.fromMillis(customTimeRange.end, {zone: ianaTimeZone}).toFormat('LL/dd/yyyy') : '');
    }, createStructuredSelector({
        customTimeRange: getCustomTimeRange,
        ianaTimeZone: getIanaTimeZone
    })));

    // Add Radio buttons for user selection of primary timeframes
    const listContainer = containerRadioGroupMainSelectButtons.append('ul')
        .attr('class', 'usa-fieldset usa-list--unstyled');
    const li = listContainer.selectAll('li')
        .attr('class', 'usa-fieldset')
        .data(DATE_RANGE)
        .enter().append('li');
    listContainer.call(link(store, drawLoadingIndicator, createStructuredSelector({
        showLoadingIndicator: isLoadingTS('current'),
        sizeClass: () => 'fa-lg'
    })));

    li.append('input')
        .attr('type', 'radio')
        .attr('name', 'ts-daterange-input')
        .attr('id', d => `${d.period}-input`)
        .attr('class', 'usa-radio__input')
        .attr('value', d => d.period)
        .attr('ga-on', 'click')
        .attr('aria-expanded', d => d.ariaExpanded)
        .attr('ga-event-category', 'TimeSeriesGraph')
        .attr('ga-event-action', d => `changeDateRangeTo${d.period}`)
        .on('change', function() {
            const selected = li.select('input:checked');
            const selectedVal = selected.attr('value');
            if (selectedVal === 'custom') {
                containerRadioGroupCustomSelectButtons.attr('hidden', null);
                selected.attr('aria-expanded', true);
            } else {
                li.select('input#custom-date-range').attr('aria-expanded', false);
                containerRadioGroupCustomSelectButtons.attr('hidden', true);
                containerCustomCalenderDays.attr('hidden', true);
                containerCustomDaysBeforeToday.attr('hidden', true);
                store.dispatch(ivTimeSeriesDataActions.retrieveExtendedIVTimeSeries(
                    siteno,
                    li.select('input:checked').attr('value')
                )).then(() => {
                    store.dispatch(ivTimeSeriesStateActions.clearIVGraphBrushOffset());
                });
            }
        });

    li.append('label')
        .attr('class', 'usa-radio__label')
        .attr('for', (d) => `${d.period}-input`)
        .text((d) => d.name);
    li.call(link(store, (elem, dateRangeKind) => {
        elem.select(`#${dateRangeKind}-input`).property('checked', true);
    }, getCurrentDateRangeKind));
};