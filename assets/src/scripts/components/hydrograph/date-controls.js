import { DateTime } from 'luxon';
import { createStructuredSelector } from 'reselect';

import { dispatch, link } from '../../lib/redux';

import { loadingIndicator } from './loadingIndicator';
import { isLoadingTS, hasAnyTimeSeries } from '../../selectors/time-series-selector';
import { Actions } from '../../store';


export const drawDateRangeControls = function(elem, siteno) {
    const DATE_RANGE = [{
        label: 'seven-day',
        name: '7 days',
        period: 'P7D'
    }, {
        label: 'thirty-days',
        name: '30 days',
        period: 'P30D'
    }, {
        label: 'one-year',
        name: '1 year',
        period: 'P1Y'
    }, {
        label: 'custom-date-range',
        name: 'Custom',
        period: 'custom',
        ariaExpanded: false
    }];

    const container = elem.insert('div', ':nth-child(2)')
        .attr('id', 'ts-daterange-select-container')
        .attr('role', 'radiogroup')
        .attr('aria-label', 'Time interval select')
        .call(link(function(container, showControls) {
            container.attr('hidden', showControls ? null : true);
        }, hasAnyTimeSeries));

    const customDateContainer = elem.insert('div', ':nth-child(3)')
        .attr('id', 'ts-customdaterange-select-container')
        .attr('role', 'customdate')
        .attr('aria-label', 'Custom date specification')
        .attr('hidden', true);

    customDateContainer.append('label')
        .attr('for', 'date-input')
        .text('Enter Dates');

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

    const startDateContainer = customDateContainer.append('div')
        .attr('id', 'start-date-input-container');

    const endDateContainer = customDateContainer.append('div')
        .attr('id', 'end-date-input-container');

    startDateContainer.append('label')
        .attr('class', 'usa-label')
        .attr('id', 'custom-start-date-label')
        .attr('for', 'custom-start-date')
        .text('Start Date');

    const customStartDate = startDateContainer.append('input')
        .attr('class', 'usa-input')
        .attr('id', 'custom-start-date')
        .attr('name', 'user-specified-start-date')
        .attr('aria-labelledby', 'custom-start-date-label')
        .attr('type', 'date');

    endDateContainer.append('label')
        .attr('class', 'usa-label')
        .attr('id', 'custom-end-date-label')
        .attr('for', 'custom-end-date')
        .text('End Date');

    const customEndDate = endDateContainer.append('input')
        .attr('class', 'usa-input')
        .attr('id', 'custom-end-date')
        .attr('name', 'user-specified-end-date')
        .attr('aria-labelledby', 'custom-end-date-label')
        .attr('type', 'date');

    customDateContainer.append('br');

    const submitContainer = customDateContainer.append('div')
        .attr('class', 'submit-button');

    submitContainer.append('button')
        .attr('class', 'usa-button')
        .attr('id', 'custom-date-submit')
        .text('Submit')
        .on('click', dispatch( function() {
            const userSpecifiedStart = customStartDate.node().value;
            const userSpecifiedEnd = customEndDate.node().value;
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
                return Actions.retrieveUserRequestedDataForDateRange(
                    siteno,
                    userSpecifiedStart,
                    userSpecifiedEnd
                );
            }
        }));

    const listContainer = container.append('ul')
        .attr('class', 'usa-fieldset usa-list--unstyled');
    const li = listContainer.selectAll('li')
        .attr('class', 'usa-fieldset')
        .data(DATE_RANGE)
        .enter().append('li');
    listContainer.call(link(loadingIndicator, createStructuredSelector({
        showLoadingIndicator: isLoadingTS('current'),
        sizeClass: () => 'fa-lg'
    })));

    li.append('input')
        .attr('type', 'radio')
        .attr('name', 'ts-daterange-input')
        .attr('id', d => d.label)
        .attr('class', 'usa-radio__input')
        .attr('value', d => d.period)
        .attr('ga-on', 'click')
        .attr('aria-expanded', d => d.ariaExpanded)
        .attr('ga-event-category', 'TimeSeriesGraph')
        .attr('ga-event-action', d => `changeDateRangeTo${d.period}`)
        .on('change', dispatch(function() {
            const selected = li.select('input:checked');
            const selectedVal = selected.attr('value');
            if (selectedVal === 'custom') {
                customDateContainer.attr('hidden', null);
                selected.attr('aria-expanded', true);
            } else {
                li.select('input#custom-date-range').attr('aria-expanded', false);
                customDateContainer.attr('hidden', true);
                return Actions.retrieveExtendedTimeSeries(
                    siteno,
                    li.select('input:checked').attr('value')
                );
            }
        }));
    li.append('label')
        .attr('class', 'usa-radio__label')
        .attr('for', (d) => d.label)
        .text((d) => d.name);
    li.select(`#${DATE_RANGE[0].label}`).attr('checked', true);
};