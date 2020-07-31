import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import {link} from '../../../lib/d3-redux';
import {drawLoadingIndicator} from '../../../d3-rendering/loading-indicator';

import {
    isLoadingTS,
    hasAnyTimeSeries,
    getCurrentDateRangeKind,
    getCustomTimeRange} from '../../selectors/time-series-selector';
import {Actions as ivTimeSeriesDataActions} from '../../store/instantaneous-value-time-series-data';
import {Actions as ivTimeSeriesStateActions} from '../../store/instantaneous-value-time-series-state';

export const drawDateRangeControls = function(elem, store, siteno) {
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

    const container = elem.insert('div', ':nth-child(2)')
        .attr('id', 'ts-daterange-select-container')
        .attr('role', 'radiogroup')
        .attr('aria-label', 'Time interval select')
        .call(link(store,function(container, showControls) {
            container.attr('hidden', showControls ? null : true);
        }, hasAnyTimeSeries));

    const customDateContainer = elem.insert('form', ':nth-child(3)')
        .attr('id', 'ts-customdaterange-select-container')
        .attr('role', 'customdate')
        .attr('class', 'usa-form')
        .attr('aria-label', 'Custom date specification')
        .call(link(store, (container, dateRangeKind) => {
            container.attr('hidden', dateRangeKind === 'custom' ? null : true);
        }, getCurrentDateRangeKind));

    customDateContainer.append('label')
        .attr('for', 'date-input')
        .text('Enter Dates');

    const dateRangePicker = customDateContainer.append('div')
        .attr('class', 'usa-date-range-picker');
       
    const customDateValidationContainer = customDateContainer.append('div')
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
        // .attr('id', 'start-date-form-group')
        .attr('class', 'usa-form-group');

    const endDateFormGroup = dateRangePicker.append('div')
        // .attr('id', 'end-date-form-group')
        .attr('class', 'usa-form-group');

    startDateFormGroup.append('label')
        .attr('class', 'usa-label')
        .attr('id', 'custom-start-date-label')
        .attr('for', 'custom-start-date')
        .text('Start Date');

    startDateFormGroup.append('div')
        .attr('class', 'usa-hint')
        .attr('id', 'custom-start-date-hint')
        .text('mm/dd/yyyy');

    const customStartDate = startDateFormGroup.append('div')
        .attr('class', 'usa-date-picker')
        .attr('data-max-date', '')
        .attr('data-range-date', '')
        .attr('data-default-date', '');

    const customStartDateInput = customStartDate.append('input')
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
        .text('mm/dd/yyyy');

    const customEndDate = endDateFormGroup.append('div')
        .attr('class', 'usa-date-picker')
        .attr('data-max-date', '')
        .attr('data-range-date', '')
        .attr('data-default-date', '');

    const customEndDateInput = customEndDate.append('input')
        .attr('class', 'usa-input')
        .attr('id', 'custom-end-date')
        .attr('name', 'custom-end-date')
        .attr('type', 'text')
        .attr('aria-describedby', 'custom-end-date-label custom-end-date-hint');
      

    const submitContainer = customDateContainer.append('div')
        .attr('class', 'submit-button');

    submitContainer.append('button')
        .attr('class', 'usa-button')
        .attr('id', 'custom-date-submit')
        .text('Submit')
        .on('click', function() {
            const userSpecifiedStart = customStartDateInput.node().value;
            const userSpecifiedEnd = customEndDateInput.node().value;
            if (userSpecifiedStart.length === 0 || userSpecifiedEnd.length === 0) {
                dateAlertBody.selectAll('p').remove();
                dateAlertBody.append('p')
                    .text('Both start and end dates must be specified.');
                customDateValidationContainer.attr('hidden', null);
            } else if (DateTime.fromISO(userSpecifiedEnd) < DateTime.fromISO(userSpecifiedStart)) {
                dateAlertBody.selectAll('p').remove();
                dateAlertBody.append('p')
                    .text('The start date must precede the end date.');
                customDateValidationContainer.attr('hidden', null);
            } else {
                customDateValidationContainer.attr('hidden', true);
                store.dispatch(ivTimeSeriesDataActions.retrieveUserRequestedIVDataForDateRange(
                    siteno,
                    userSpecifiedStart,
                    userSpecifiedEnd
                )).then(() => store.dispatch(ivTimeSeriesStateActions.clearIVGraphBrushOffset()));
            }
        });

    customDateContainer.call(link(store, (container, customTimeRange) => {
        container.select('#custom-start-date')
            .attr('value', customTimeRange && customTimeRange.start ? DateTime.fromMillis(customTimeRange.start).toFormat('yyyy-LL-dd') : '');
        container.select('#custom-end-date')
            .attr('value', customTimeRange && customTimeRange.end ? DateTime.fromMillis(customTimeRange.end).toFormat('yyyy-LL-dd') : '');
    }, getCustomTimeRange));

    const listContainer = container.append('ul')
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
                customDateContainer.attr('hidden', null);
                selected.attr('aria-expanded', true);
            } else {
                li.select('input#custom-date-range').attr('aria-expanded', false);
                customDateContainer.attr('hidden', true);
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