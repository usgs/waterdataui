import {select} from 'd3-selection';
import {createStructuredSelector} from 'reselect';
import {link} from '../../../lib/d3-redux';
import {Actions} from '../../store/daily-value-time-series';
import {hasMultipleParameterCodes, getAvailableDVTimeSeries} from '../../selectors/daily-value-time-series-selector';

const drawDVTimeSeriesSelection = function(ul, {multipleParamCds, dvTimeSeries}, store) {

    if (multipleParamCds) {
        let paramCodeElements = {};
        let divSize = 25;
        ul.append('li')
                   .text('Parameter Codes')

        dvTimeSeries.forEach((dvTs) => {
            let element;
            let paramCd = dvTs.parameterCode;
            let ts_id = dvTs.id.split('-')[2];
            let monitorLoc = `${dvTs.id.split('-')[0]}-${dvTs.id.split('-')[1]}`;

            if (Object.keys(paramCodeElements).includes(paramCd)){
                element = paramCodeElements[paramCd];
            } else {
                divSize += 30;
                element = ul.append('li')
                     .classed('usa-radio', true);

                let input = element.append('input')
                    .classed('usa-radio__input', true)
                    .attr('type', 'radio')
                    .attr('id', `code-${paramCd}-radio`)
                    .attr('aria-labelledby', `code-${paramCd}-label`)
                    .attr('ga-on', 'click')
                    .attr('ga-event-category', 'DVSeriesGraph')
                    .attr('ga-event-action', 'toggleCurrentTS')
                    .attr('name', 'dvParamCd')
                    .on('click', function() {
                         store.dispatch(Actions.retrieveDVTimeSeries(
                            monitorLoc, ts_id
                        ));
                        store.dispatch(Actions.setCurrentDVTimeSeriesIds(
                            this.getAttribute('data-00002'),
                            this.getAttribute('data-00003'),
                            this.getAttribute('data-00001')));
                    });

               if (Object.keys(paramCodeElements).length < 1){
                   input.attr('checked', 'checked');
               }

               element.append('label')
                   .classed('usa-radio__label', true)
                   .attr('id', `code-${paramCd}-label`)
                   .attr('for', `code-${paramCd}-radio`)
                   .text(`${paramCd}`);
            }

            element.select('input[type="radio"]')
                .attr(`data-${dvTs.statisticCode}`, ts_id);

            paramCodeElements[paramCd] = element;
        });
        select('.dv-legend-container ').style('min-height', `${divSize}px`);
    };
};
/*
 * Create the show audible toggle, last year toggle, and median toggle for the time series graph.
 * @param {Object} elem - D3 selection
 */
export const drawGraphControls = function(elem, store) {

    elem.append('ul')
        .classed('usa-fieldset', true)
        .classed('usa-list--unstyled', true)
        .classed('graph-controls-container', true)
        .call(link(store, drawDVTimeSeriesSelection, createStructuredSelector({
            multipleParamCds: hasMultipleParameterCodes,
            dvTimeSeries: getAvailableDVTimeSeries
        }), store));
};
