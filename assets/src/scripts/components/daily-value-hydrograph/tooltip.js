import {DateTime} from 'luxon';
import {createStructuredSelector} from 'reselect';

import {drawCursorSlider} from '../../d3-rendering/cursor-slider';
import {drawFocusCircles, drawFocusOverlay, drawFocusLine} from '../../d3-rendering/graph-tooltip';
import {link} from '../../lib/d3-redux';
import {getDVGraphCursorOffset, getCurrentDVTimeSeriesUnitOfMeasure} from '../../selectors/daily-value-time-series-selector';
import {Actions} from '../../store/daily-value-time-series';

import {getMainLayout} from './selectors/layout';
import {getMainXScale, getMainYScale} from './selectors/scales';
import {getCurrentCursorPoint, getCurrentDataPointsAtCursor, getCursorEpochTime} from './selectors/time-series-data';

const TOOLTIP_LABEL = {
    min: 'Min',
    median: 'Mean',
    max: 'Max'
};

const drawOnePointText = function(elem, point, statLabel, unitOfMeasure, marginLeft) {
    if (point) {
        const dateLabel = DateTime.fromMillis(point.dateTime, {zone: 'UTC'}).toFormat('yyyy-LL-dd');
        const label = point.isMasked ?
            `${statLabel} ${point.label} - ${dateLabel}` :
            `${statLabel} ${point.value} ${unitOfMeasure} - ${dateLabel}`;

        elem.append('div')
            .attr('style', `margin-left: ${marginLeft}px`)
            .classed('dv-tooltip-text', true)
            .classed(point.class, true)
            .text(label);
    }
};

/*
 * Renders the tooltip text representing the data at the current cursor position
 * @param {D3 selection} - elem
 * @param {Redux store] store
 */
export const drawTooltipText = function(elem, store) {
    elem.append('div')
        .attr('class', 'dv-tooltip-container')
        .call(link(store, (elem, {pointsAtCursorOffset, unitOfMeasure, layout}) => {
            elem.selectAll('.dv-tooltip-text').remove();
            drawOnePointText(elem, pointsAtCursorOffset.max, TOOLTIP_LABEL.max, unitOfMeasure, layout.margin.left);
            drawOnePointText(elem, pointsAtCursorOffset.median, TOOLTIP_LABEL.median, unitOfMeasure, layout.margin.left);
            drawOnePointText(elem, pointsAtCursorOffset.min, TOOLTIP_LABEL.min, unitOfMeasure, layout.margin.left);

        }, createStructuredSelector({
            pointsAtCursorOffset: getCurrentDataPointsAtCursor,
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
