// Required to initialize USWDS components after page load (WaterAlert ToolTips)
import {tooltip} from 'uswds-components';

import {select, selectAll} from 'd3-selection';

import config from 'ui/config';
import {link} from 'ui/lib/d3-redux';

import {appendInfoTooltip} from 'd3render/info-tooltip';

import {getInputsForRetrieval, getSelectedParameterCode} from 'ml/selectors/hydrograph-state-selector';

import {setSelectedParameterCode} from 'ml/store/hydrograph-state';
import {retrieveHydrographData} from 'ml/store/hydrograph-data';

import {getAvailableParameters} from './selectors/parameter-data';

import {showDataIndicators} from './data-indicator';

/*
* Helper function that adds the on click open and close functionality. Stopping event propagation is needed to prevent
* clicks on the containing element from changing this elements behavior.
* @param {Object} element - the element to add the on click action
* @param {Object} parameter - Contains details about the current parameter code
*/
const addRowExpansionControl = function(element, parameter) {
    if (parameter.waterAlert.hasWaterAlert) {
        element
            .text('open')
            .on('click', function(event) {
                event.stopPropagation();
                selectAll('.wateralert-row')
                    .filter(function() {
                        return this.id !== `wateralert-row-${parameter.parameterCode}`;
                    })
                    .attr('hidden', 'true');
                select(`#wateralert-row-${parameter.parameterCode}`)
                    .attr('hidden', select(`#wateralert-row-${parameter.parameterCode}`).attr('hidden') !== null ? null : 'true');
            });
    }
};

/*
* Helper function that draws the main containing rows. Note the 'parameter selection' is a nested USWD grid. This section of code
* creates the main grid rows for each parameter and adds on click functions. Later, another grid will be nested in these rows.
* @param {Object} Store - The application Redux state
* @param {String} siteno - A unique identifier for the monitoring location
* @param {Object} element - The target element to append the row
* @param {Object} parameter - Contains details about the current parameter code
* @return {Object} The HTML for the created container row
*/
const drawContainingRow = function(store, siteno, element, parameter) {
    return element.append('div')
        .attr('id', `container-row-${parameter.parameterCode}`)
        .attr('class', 'grid-container grid-row-container-row')
        .call(link(store, (elem, selectedParameterCode) => {
            elem.classed('selected', parameter.parameterCode === selectedParameterCode)
                .attr('aria-selected', parameter.parameterCode === selectedParameterCode);
        }, getSelectedParameterCode))
        .on('click', function() {
            const thisClass = select(this)
                .attr('class');
            selectAll('.wateralert-row')
                .attr('hidden', 'true');
            select(`#wateralert-row-${parameter.parameterCode}`).attr('hidden', null);

            if (!thisClass || !thisClass.includes('selected')) {
                store.dispatch(setSelectedParameterCode(parameter.parameterCode));
                showDataIndicators(true, store);
                store.dispatch(retrieveHydrographData(siteno, getInputsForRetrieval(store.getState())))
                    .then(() => {
                        showDataIndicators(false, store);
                    });
            }
        });
};

/*
* Helper function that creates the top row of each parameter selection. This row is hidden except on narrow screens
* and contains the period of record that appears above the parameter description.
* @param {Object} Element - The target element to append the row
* @param {Object} parameter - Contains details about the current parameter code
* @return {Object} The HTML for the grid row
* */
const drawTopPeriodOfRecordRow = function(element, parameter) {
    const gridRowInnerTopPeriodOfRecord = element.append('div')
        .attr('class', 'grid-row grid-row-inner grid-row-period-of-record');
    gridRowInnerTopPeriodOfRecord.append('div')
        .attr('class', 'grid-col grid-offset-1')
        .text(`${parameter.periodOfRecord.begin_date} to ${parameter.periodOfRecord.end_date}`);
    const TopPeriodOfRecordRowExpansionControlDiv = gridRowInnerTopPeriodOfRecord.append('div')
        .attr('class', 'grid-col open-close-top-period-of-record');

    addRowExpansionControl(TopPeriodOfRecordRowExpansionControlDiv, parameter);

    return gridRowInnerTopPeriodOfRecord;
};

/*
* Helper function that draws the row containing the radio button and parameter description.
* @param {Object} Store - The application Redux state
* @param {Object} Element - The target element to append the row
* @param {Object} parameter - Contains details about the current parameter code
* @return {Object} The HTML for the grid row
*/
const drawRadioButtonRow = function(store, element, parameter) {
    const gridRowInnerWithRadioButton = element.append('div')
        .attr('class', 'grid-row grid-row-inner');
    const radioButtonDiv = gridRowInnerWithRadioButton.append('div')
        .attr('class', 'grid-col-1 radio-button__param-select')
        .append('div')
        .attr('class', 'usa-radio');
    radioButtonDiv.append('input')
        .attr('class', 'usa-radio__input')
        .attr('id', `radio-${parameter.parameterCode}`)
        .attr('type', 'radio')
        .attr('name', 'parameter-selection')
        .attr('value', `${parameter.parameterCode}`)
        .call(link(store, (inputElem, selectedParameterCode) => {
            inputElem.property('checked', parameter.parameterCode === selectedParameterCode ? true : null);
        }, getSelectedParameterCode));
    radioButtonDiv.append('label')
        .attr('class', 'usa-radio__label')
        .attr('for', `radio-${parameter.parameterCode}`);
    gridRowInnerWithRadioButton.append('div')
        .attr('class', 'grid-col-7 description__param-select')
        .append('div')
        .text(`${parameter.description}`);
    gridRowInnerWithRadioButton.append('div')
        .attr('class', 'grid-col grid-col-auto period-of-record__param-select')
        .text(`${parameter.periodOfRecord.begin_date} to ${parameter.periodOfRecord.end_date}`);
    const radioRowExpansionControlDiv = gridRowInnerWithRadioButton.append('div')
        .attr('class', 'grid-col open-close-radio_button_row');
    addRowExpansionControl(radioRowExpansionControlDiv, parameter);

    return gridRowInnerWithRadioButton;
};

/*
* Helper function that draws a row containing the controls for the WaterAlert subscription.
* @param {String} siteno - A unique identifier for the monitoring location
* @param {Object} Element - The target element to append the row
* @param {Object} parameter - Contains details about the current parameter code
* @return {Object} The HTML for the grid row
*/
const drawWaterAlertRow = function(siteno, element, parameter) {
    const gridRowInnerWaterAlert = element.append('div')
        .attr('class', 'grid-row grid-row-inner');
console.log('parameter ', parameter)
    if(parameter.waterAlert.hasWaterAlert) {
        gridRowInnerWaterAlert.append('div')
            .attr('id', `wateralert-row-${parameter.parameterCode}`)
            .attr('hidden', true)
            .attr('class', 'grid-col grid-offset-1 wateralert-row')
            .append('a')
            .attr('href', `${config.WATERALERT_SUBSCRIPTION}/?site_no=${siteno}&parm=${parameter.parameterCode}`)
            .attr('class', 'water-alert-cell usa-tooltip')
            .attr('data-position', 'left')
            .attr('data-classes', 'width-full tablet:width-auto')
            .attr('title', parameter.waterAlert.tooltipText)
            .text(parameter.waterAlert.displayText);            
    }

    return gridRowInnerWaterAlert;
};

/*
* A main function that creates the parameter selection list
* @param {Object} Store - The application Redux state
* @param {Object} Element - The target element to append the selection list
* @param {String} siteno - A unique identifier for the monitoring location
* */
export const drawSelectionList = function(container, store, siteno) {
    const parameters = getAvailableParameters(store.getState());

    if (!Object.keys(parameters).length) {
        return;
    }

    container.append('div')
        .attr('id', 'parameter-selection-container')
        .append('h2')
        .text('Select Data to Graph');
    const selectionList = container.append('div')
        .attr('class', 'grid-container');

    parameters.forEach(parameter => {
        // Add the main grid rows
        const containerRow = drawContainingRow(store, siteno, selectionList, parameter);
        // Add the nested grid rows
        drawTopPeriodOfRecordRow(containerRow, parameter);
        drawRadioButtonRow(store, containerRow, parameter);
        drawWaterAlertRow(siteno, containerRow, parameter);
        // Add the expansion container

        // Add the rows nested in the expansion container

    });
};

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