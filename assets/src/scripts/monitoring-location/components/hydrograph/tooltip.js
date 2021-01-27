import {select} from 'd3-selection';
import {transition} from 'd3-transition';
import {DateTime} from 'luxon';
import {createSelector, createStructuredSelector} from 'reselect';

import config from 'ui/config';
import {link} from 'ui/lib/d3-redux';
import {mediaQuery} from 'ui/utils';

import {drawCursorSlider} from 'd3render/cursor-slider';
import {drawFocusOverlay, drawFocusCircles, drawFocusLine} from 'd3render/graph-tooltip';

import {getCurrentParmCd} from 'ml/selectors/time-series-selector';
import {Actions} from 'ml/store/instantaneous-value-time-series-state';

import {getCursorTime, getTsCursorPoints, getTooltipPoints, getGroundwaterLevelCursorPoint,
    getGroundwaterLevelTooltipPoint} from './selectors/cursor';
import {classesForPoint, MASK_DESC} from './selectors/drawing-data';
import {getMainLayout} from './selectors/layout';
import {getMainXScale, getMainYScale} from './selectors/scales';
import {getTsTimeZone, getCurrentVariableUnitCode} from './selectors/time-series-data';


const getTooltipText = function(datum, unitCode, ianaTimeZone) {
    let label = '';
    if (datum) {
        let valueStr = datum.value === null ? ' ' : `${datum.value} ${unitCode}`;
        const maskKeys = new Set(Object.keys(MASK_DESC));
        const qualifierKeysLower = new Set(datum.qualifiers.map(x => x.toLowerCase()));
        const maskKeyIntersect = Array.from(qualifierKeysLower.values()).filter(x => maskKeys.has(x));

        if (maskKeyIntersect.length) {
            // a data point will have at most one masking qualifier
            valueStr = MASK_DESC[maskKeyIntersect[0]];
        }
        const timeLabel = DateTime.fromMillis(
            datum.dateTime,
            {zone: ianaTimeZone}
        ).toFormat('MMM dd, yyyy hh:mm:ss a ZZZZ');
        label = `${valueStr} - ${timeLabel}`;
    }

    return label;
};

const createTooltipTextGroup = function(elem, {currentPoints, comparePoints, unitCode, ianaTimeZone, layout, currentParmCd}, textGroup) {
    const adjustMarginOfTooltips = function(elem) {
        let marginAdjustment = layout.margin.left;
        elem.style('margin-left', marginAdjustment + 'px');
    };

    if (!textGroup) {
        textGroup = elem.append('div')
            .attr('class', 'tooltip-text-group')
            .call(adjustMarginOfTooltips);
    }

    let data = Object.values(currentPoints).concat(Object.values(comparePoints));

    const texts = textGroup
        .selectAll('div')
        .data(data);

    // Remove old text labels
    texts.exit()
        .remove();

    // Add new text labels
    const newTexts = texts.enter()
        .append('div');

    // Update the text and backgrounds of all tooltip labels
    const merge = texts.merge(newTexts);
    merge
        .text(datum => getTooltipText(datum, unitCode, ianaTimeZone, currentParmCd))
        .each(function(datum) {
            const classes = classesForPoint(datum);
            const text = select(this);
            text.attr('class', d => `${d.tsKey}-tooltip-text`);
            text.classed('approved', classes.approved);
            text.classed('estimated', classes.estimated);
        });

    return textGroup;
};


/*
 * Append a group containing the tooltip text elements to elem
 * @param {Object} elem - D3 selector
 */
export const drawTooltipText = function(elem, store) {
    elem.call(link(store, createTooltipTextGroup, createStructuredSelector({
        currentPoints: getTsCursorPoints('current'),
        comparePoints: getTsCursorPoints('compare'),
        unitCode: getCurrentVariableUnitCode,
        layout: getMainLayout,
        ianaTimeZone: getTsTimeZone,
        currentParmCd: getCurrentParmCd
    })));
};

/*
 * Appends a group to elem containing a focus line and circles for the current and compare time series
 * @param {Object} elem - D3 select
 * @param {Object} store - Redux.Store
 * @param {Object} yScale - D3 Y scale for the graph
 */
export const drawTooltipFocus = function(elem, store) {
    elem.call(link(store, drawFocusLine, createStructuredSelector({
        xScale: getMainXScale('current'),
        yScale: getMainYScale,
        cursorTime: getCursorTime('current')
    })));

    elem.call(link(store, drawFocusCircles, createSelector(
        getTooltipPoints('current'),
        getTooltipPoints('compare'),
        (current, compare) => {
            return current.concat(compare);
        }
    )));

    elem.call(link(
        store,
        drawFocusOverlay,
        createStructuredSelector({
            xScale: getMainXScale('current'),
            layout: getMainLayout
        }),
        store,
        Actions.setIVGraphCursorOffset)
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
            cursorOffset: (state) => state.ivTimeSeriesState.ivGraphCursorOffset,
            xScale: getMainXScale('current'),
            layout: getMainLayout
        }), store, Actions.setIVGraphCursorOffset));
};
