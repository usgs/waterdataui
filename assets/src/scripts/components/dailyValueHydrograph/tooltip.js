import includes from 'lodash/includes';
import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import {drawFocusCircles, drawFocusOverlay} from '../../d3-rendering/graph-tooltip';
import {link} from '../../lib/d3-redux';
import {getCurrentObservationsTimeSeriesUnitOfMeasure} from '../../selectors/observations-selector';
import {Actions} from '../../store';

import {APPROVED, ESTIMATED} from './time-series-graph';
import {getLayout} from './selectors/layout';
import {getXScale} from './selectors/scales';
import {getCursorPoint, getDataAtCursor} from './selectors/time-series-data';

/*
 * Renders the tooltip text representing the data at the current cursor position
 * @param {D3 selection} - elem
 * @param {Redux store] store
 */
export const drawTooltipText = function(elem, store) {
    elem.append('div')
        .attr('class', 'dv-tooltip-container')
        .call(link(store, (elem, {pointAtCursorOffset, unitOfMeasure, layout}) => {
            elem.select('.dv-tooltip-text').remove();

            if (pointAtCursorOffset) {
                console.log(`Drawing tooltip for time ${pointAtCursorOffset.dateTime}`);
                elem.append('div')
                    .attr('style', `margin-left: ${layout.margin.left}px`)
                    .classed('dv-tooltip-text', true)
                    .classed('approved', includes(pointAtCursorOffset.approvals, APPROVED))
                    .classed('estimated', includes(pointAtCursorOffset.approvals, ESTIMATED))
                    .text(`${pointAtCursorOffset.value} ${unitOfMeasure} - ${DateTime.fromMillis(pointAtCursorOffset.dateTime).toFormat('yyyy-LL-dd', {zone: 'UTC'})}`);
            }

        }, createStructuredSelector({
            pointAtCursorOffset: getDataAtCursor,
            unitOfMeasure: getCurrentObservationsTimeSeriesUnitOfMeasure,
            layout: getLayout
        })));
};

/*
 * Renders the tooltip focus elements
 * @param {D3 selection - group or svg} elem
 * @param {Redux store} store
 */
export const drawTooltipFocus = function(elem, store) {
    elem
        .call(link(store, drawFocusCircles, getCursorPoint))
        .call(link(
            store,
            drawFocusOverlay,
            createStructuredSelector({
                xScale: getXScale,
                layout: getLayout
            }),
            store,
            Actions.setDailyValueCursorOffset)
    );
};