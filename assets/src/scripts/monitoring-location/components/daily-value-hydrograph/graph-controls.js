import _ from 'lodash';
import {select} from 'd3-selection';
import {Actions} from '../../store/daily-value-time-series';

/*
 * Draw the parameter code toggle for the daily values time series graph.
 * @param {Object} elem - D3 selection
 * @param {Object} store - Redux Store
 */
const drawDVTimeSeriesSelection = function(ul, store) {

    const availTimeSeries = store.getState()
        .dailyValueTimeSeriesData.availableDVTimeSeries;
    const groupedTs = _.groupBy(availTimeSeries, (ts) => { return ts.parameterCode});
    const groupedKeys = Object.keys(groupedTs);
    let checked = false;

    if (groupedKeys.length > 1) {
        let divSize = 30;
        ul.append('li')
            .text('Parameter Codes')

        groupedKeys.forEach((key) => {

            const paramCd = groupedTs[key][0].parameterCode;
            const ts_id = groupedTs[key][0].id.split('-')[2];
            const monitorLoc = `${groupedTs[key][0].id.split('-')[0]}-${groupedTs[key][0].id.split('-')[1]}`;
            const element = ul.append('li')
                 .classed('usa-radio', true);

            const input = element.append('input')
                .classed('usa-radio__input', true)
                .attr('type', 'radio')
                .attr('id', `code-${paramCd}-radio`)
                .attr('aria-labelledby', `code-${paramCd}-label`)
                .attr('ga-on', 'click')
                .attr('ga-event-category', 'DVSeriesGraph')
                .attr('ga-event-action', 'toggleParameterCode')
                .attr('name', 'dvParamCd');

            input.on('click', function() {
                store.dispatch(Actions.retrieveDVTimeSeries(
                    monitorLoc, ts_id
                )).then(function () {
                    store.dispatch(Actions.setCurrentDVTimeSeriesIds(
                        input.attr('data-00002'),
                        input.attr('data-00003'),
                        input.attr('data-00001')));
                })});

            if (!checked){
                input.attr('checked', 'checked');
                checked = true;
            }

            element.append('label')
                .classed('usa-radio__label', true)
                .attr('id', `code-${paramCd}-label`)
                .attr('for', `code-${paramCd}-radio`)
                .text(`${paramCd}`);

            groupedTs[key].forEach((ts) => {
                element.select('input[type="radio"]')
                .attr(`data-${ts.statisticCode}`, ts_id);
            });

            divSize += 30;
        });

        select('.dv-legend-container ').style('min-height', `${divSize}px`);
    };
};

/*
 * Create the parameter code toggle for the daily values time series graph.
 * @param {Object} elem - D3 selection
 * @param {Object} store - Redux Store
 */
export const drawGraphControls = function(elem, store) {

    elem.append('ul')
        .classed('usa-fieldset', true)
        .classed('usa-list--unstyled', true)
        .classed('graph-controls-container', true)
        .call(drawDVTimeSeriesSelection, store);
};
