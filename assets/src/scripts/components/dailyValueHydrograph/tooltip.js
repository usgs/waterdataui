import includes from 'lodash/includes';
import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import {drawCursorSlider} from '../../d3-rendering/cursor-slider';
import {drawFocusCircles, drawFocusOverlay, drawFocusLine} from '../../d3-rendering/graph-tooltip';
import {link} from '../../lib/d3-redux';
import {getObservationsCursorOffset, getCurrentObservationsTimeSeriesUnitOfMeasure} from '../../selectors/observations-selector';
import {Actions} from '../../store';

import {APPROVED, ESTIMATED} from './time-series-graph';
import {getMainLayout} from './selectors/layout';
import {getMainXScale, getMainYScale} from './selectors/scales';
import {getCursorPoint, getDataAtCursor, getCursorEpochTime} from './selectors/time-series-data';

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
                elem.append('div')
                    .attr('style', `margin-left: ${layout.margin.left}px`)
                    .classed('dv-tooltip-text', true)
                    .classed('approved', includes(pointAtCursorOffset.approvals, APPROVED))
                    .classed('estimated', includes(pointAtCursorOffset.approvals, ESTIMATED))
                    .text(`${pointAtCursorOffset.value} ${unitOfMeasure} - ${DateTime.fromMillis(pointAtCursorOffset.dateTime, {zone: 'UTC'}).toFormat('yyyy-LL-dd')}`);
            }

        }, createStructuredSelector({
            pointAtCursorOffset: getDataAtCursor,
            unitOfMeasure: getCurrentObservationsTimeSeriesUnitOfMeasure,
            layout: getMainLayout
        })));
};

/*
 * Renders the tooltip focus elements
 * @param {D3 selection - group or svg} elem
 * @param {Redux store} store
 */
export const drawTooltipFocus = function(elem, store) {
    elem
        .call(link(store, drawFocusLine, createStructuredSelector({
            cursorTime: getCursorEpochTime,
            xScale: getMainXScale,
            yScale: getMainYScale
        })))
        .call(link(store, drawFocusCircles, getCursorPoint))
        .call(link(
            store,
            drawFocusOverlay,
            createStructuredSelector({
                xScale: getMainXScale,
                layout: getMainLayout
            }),
            store,
            Actions.setDailyValueCursorOffset)
    );
};

/*
 * Renders the cursor slider used to move the tooltip focus
 * @param {D3 selection} elem
 * @param {Redux store} store
 */
export const drawTooltipCursorSlider = function(elem, store) {
    elem.call(link(
        store,
        drawCursorSlider,
        createStructuredSelector({
            cursorOffset: getObservationsCursorOffset,
            xScale: getMainXScale,
            layout: getMainLayout
        }),
        store,
        Actions.setDailyValueCursorOffset
    ));
};