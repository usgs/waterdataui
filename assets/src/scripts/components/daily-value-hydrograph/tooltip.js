import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import {drawCursorSlider} from '../../d3-rendering/cursor-slider';
import {drawFocusCircles, drawFocusOverlay, drawFocusLine} from '../../d3-rendering/graph-tooltip';
import {link} from '../../lib/d3-redux';
import {getDVGraphCursorOffset, getCurrentDVTimeSeriesUnitOfMeasure} from '../../selectors/daily-value-time-series-selector';
import {Actions} from '../../store/daily-value-time-series';

import {getMainLayout} from './selectors/layout';
import {getMainXScale, getMainYScale} from './selectors/scales';
import {getCurrentCursorPoint, getCurrentDataPointAtCursor, getCursorEpochTime} from './selectors/time-series-data';

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
                const dateLabel = DateTime.fromMillis(pointAtCursorOffset.dateTime, {zone: 'UTC'}).toFormat('yyyy-LL-dd');
                const label = pointAtCursorOffset.isMasked ?
                    `${pointAtCursorOffset.label} - ${dateLabel}` :
                    `${pointAtCursorOffset.value} ${unitOfMeasure} - ${dateLabel}`;
                    
                elem.append('div')
                    .attr('style', `margin-left: ${layout.margin.left}px`)
                    .classed('dv-tooltip-text', true)
                    .classed(pointAtCursorOffset.class, true)
                    .text(label);
            }

        }, createStructuredSelector({
            pointAtCursorOffset: getCurrentDataPointAtCursor,
            unitOfMeasure: getCurrentDVTimeSeriesUnitOfMeasure,
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
        .call(link(store, drawFocusCircles, getCurrentCursorPoint))
        .call(link(
            store,
            drawFocusOverlay,
            createStructuredSelector({
                xScale: getMainXScale,
                layout: getMainLayout
            }),
            store,
            Actions.setDVGraphCursorOffset)
    );
};

/*
 * Renders the cursor slider used to move the tooltip focus
 * @param {D3 selection} elem
 * @param {Redux store} store
 */
export const drawTooltipCursorSlider = function(elem, store) {
    elem.append('svg')
        .classed('cursor-slider-svg', true)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .call(link(store,(elem, layout) => {
                elem.attr('viewBox', `0 0 ${layout.width + layout.margin.left + layout.margin.right} 25`);
            }, getMainLayout))
        .call(link(store, drawCursorSlider, createStructuredSelector({
            cursorOffset: getDVGraphCursorOffset,
            xScale: getMainXScale,
            layout: getMainLayout
        }), store, Actions.setDVGraphCursorOffset));
};