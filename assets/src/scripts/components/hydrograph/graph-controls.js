
import {link} from '../../lib/d3-redux';
import {getCurrentVariableTimeSeries} from '../../selectors/time-series-selector';
import {Actions} from '../../store/site-store';

import {audibleUI} from './audible';
import {getCurrentVariableMedianStatistics} from '../../selectors/median-statistics-selector';
import {isVisibleSelector} from './time-series';

/*
 * Create the show audible toggle, last year toggle, and median toggle for the time series graph.
 * @param {Object} elem - D3 selection
 */
export const drawGraphControls = function(elem, store) {

    const graphControlDiv = elem.append('ul')
        .classed('usa-fieldset', true)
        .classed('usa-list--unstyled', true)
        .classed('graph-controls-container', true);

    graphControlDiv.append('li')
        .call(audibleUI, store);

    const compareControlDiv = graphControlDiv.append('li')
        .classed('usa-checkbox', true);

    compareControlDiv.append('input')
        .classed('usa-checkbox__input', true)
        .attr('type', 'checkbox')
        .attr('id', 'last-year-checkbox')
        .attr('aria-labelledby', 'last-year-label')
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'TimeSeriesGraph')
        .attr('ga-event-action', 'toggleCompare')
        .on('click', function() {
            store.dispatch(Actions.toggleTimeSeries('compare', this.checked));
        })
        // Disables the checkbox if no compare time series for the current variable
        .call(link(store,function(elem, compareTimeSeries) {
            const exists = Object.keys(compareTimeSeries) ?
                Object.values(compareTimeSeries).filter(tsValues => tsValues.points.length).length > 0 : false;
            elem.property('disabled', !exists);
        }, getCurrentVariableTimeSeries('compare')))
        // Sets the state of the toggle
        .call(link(store,function(elem, checked) {
            elem.property('checked', checked);
        }, isVisibleSelector('compare')));
    compareControlDiv.append('label')
        .classed('usa-checkbox__label', true)
        .attr('id', 'last-year-label')
        .attr('for', 'last-year-checkbox')
        .text('Compare to last year');

    const medianControlDiv = graphControlDiv.append('li')
        .classed('usa-checkbox', true);

    medianControlDiv.append('input')
        .classed('usa-checkbox__input', true)
        .attr('type', 'checkbox')
        .attr('id', 'median-checkbox')
        .attr('aria-labelledby', 'median-label')
        .attr('ga-on', 'click')
        .attr('ga-event-category', 'TimeSeriesGraph')
        .attr('ga-event-action', 'toggleMedian')
        .on('click', function() {
            store.dispatch(Actions.toggleTimeSeries('median', this.checked));
        })
        // Disables the checkbox if no median data for the current variable
        .call(link(store,function(elem, medianData) {
            elem.property('disabled', medianData === null);
        }, getCurrentVariableMedianStatistics))
        // Sets the state of the toggle
        .call(link(store,function(elem, checked) {
            elem.property('checked', checked);
        }, isVisibleSelector('median')));

    medianControlDiv.append('label')
        .classed('usa-checkbox__label', true)
        .attr('id', 'median-label')
        .attr('for', 'median-checkbox')
        .text('Toggle median');
};