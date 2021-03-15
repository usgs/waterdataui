// Required to initialize USWDS components after page load (WaterAlert ToolTips)
import {tooltip} from 'uswds-components';

import {select} from 'd3-selection';

import config from 'ui/config';
import {link} from 'ui/lib/d3-redux';

import {appendInfoTooltip} from 'd3render/info-tooltip';

import {getInputsForRetrieval, getSelectedParameterCode} from 'ml/selectors/hydrograph-state-selector';

import {setSelectedParameterCode} from 'ml/store/hydrograph-state';
import {retrieveHydrographData} from 'ml/store/hydrograph-data';

import {getAvailableParameters} from './selectors/parameter-data';

import {showDataIndicators} from './data-indicator';

/**
 * Draws a table with clickable rows of time series parameter codes. Selecting
 * a row changes the active parameter code.
 */
export const drawSelectionTable = function(container, store, siteno) {
    const parameters = getAvailableParameters(store.getState());

    if (!Object.keys(parameters).length) {
        return;
    }

    const columnHeaders = ['   ', 'Parameter', 'Period of Record', 'WaterAlert'];
    const tableContainer = container.append('div')
        .attr('id', 'select-time-series');

    tableContainer.append('label')
        .attr('id', 'select-time-series-label')
        .text('Select a time series');
    const table = tableContainer.append('table')
        .classed('usa-table', true)
        .classed('usa-table--borderless', true)
        .attr('aria-labelledby', 'select-time-series-label')
        .attr('tabindex', 0)
        .attr('role', 'listbox');

    table.append('thead')
        .append('tr')
            .selectAll('th')
            .data(columnHeaders)
            .enter().append('th')
                .attr('scope', 'col')
                .text(d => d);
    table.append('tbody')
        .attr('class', 'usa-fieldset')
        .selectAll('tr')
        .data(Object.values(parameters))
        .enter().append('tr')
        .attr('id', d => `time-series-select-table-row-${d.parameterCode}`)
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'selectTimeSeries')
        .attr('ga-event-action', (d) => `time-series-parmcd-${d.parameterCode}`)
        .attr('role', 'option')
        .call(link(store, (trElem, selectedParameterCode) => {
            trElem
                .classed('selected', d => d.parameterCode === selectedParameterCode)
                .attr('aria-selected', d => d.parameterCode === selectedParameterCode);
        }, getSelectedParameterCode))
        .on('click', function(event, d) {
            const thisClass = select(this).attr('class');
            if (!thisClass || !thisClass.includes('selected')) {
                store.dispatch(setSelectedParameterCode(d.parameterCode));
                showDataIndicators(true, store);
                store.dispatch(retrieveHydrographData(siteno, getInputsForRetrieval(store.getState())))
                    .then(() => {
                        showDataIndicators(false, store);
                    });
            }
        })
        .call(tr => {
            const paramSelectCol = tr.append('td');
            paramSelectCol.append('input')
                .attr('id', d => `time-series-select-radio-button-${d.parameterCode}`)
                .attr('type', 'radio')
                .attr('name', 'param-select-radio-input')
                .attr('class', 'usa-radio__input')
                .attr('value', d => `${d.parameterCode}`)
                .call(link(store, (inputElem, selectedParameterCode) => {
                    inputElem.property('checked', d => d.parameterCode === selectedParameterCode ? true : null);
                }, getSelectedParameterCode));
            paramSelectCol.append('label')
               .attr('class', 'usa-radio__label');
            const paramCdCol = tr.append('th')
                .attr('scope', 'row');
            paramCdCol.append('span')
                .text(d => d.description)
                .each(function(d) {
                    appendInfoTooltip(select(this), `Parameter code: ${d.parameterCode}`);
                });
            tr.append('td')
                .style('white-space', 'nowrap')
                .text(d => d.periodOfRecord ?
                    `${d.periodOfRecord.begin_date} to ${d.periodOfRecord.end_date}` : '');
            tr.append('td')
                .append('div')
                .attr('class', 'wateralert-link');
        });

    // WaterAlert does not support every parameter code, so lets take that into account when adding the links
    table.selectAll('.wateralert-link').each(function(d) {
        let selection = select(this);

        let waterAlertCell;
        if (d.waterAlert.hasWaterAlert) {
            waterAlertCell = selection.append('a')
                .attr('href', `${config.WATERALERT_SUBSCRIPTION}/?site_no=${siteno}&parm=${d.waterAlert.subscriptionParameterCode}`);
        } else {
            waterAlertCell = selection;
        }
        waterAlertCell.attr('class', 'water-alert-cell usa-tooltip')
            .attr('data-position', 'left')
            .attr('data-classes', 'width-full tablet:width-auto')
            .attr('title', d.waterAlert.tooltipText)
            .text(d.waterAlert.displayText);
    });

    // Activate the USWDS toolTips for WaterAlert subscriptions
    tooltip.on(container.node());
};