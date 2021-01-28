import {DateTime} from 'luxon';
import {createSelector, createStructuredSelector} from 'reselect';

import {link} from 'ui/lib/d3-redux';

import {drawCursorSlider} from 'd3render/cursor-slider';
import {drawFocusOverlay, drawFocusCircles, drawFocusLine} from 'd3render/graph-tooltip';

import {Actions} from 'ml/store/instantaneous-value-time-series-state';

import {getCursorTime, getTsCursorPoints, getTooltipPoints, getGroundwaterLevelCursorPoint,
    getGroundwaterLevelTooltipPoint} from './selectors/cursor';
import {classesForPoint, MASK_DESC} from './selectors/drawing-data';
import {getMainLayout} from './selectors/layout';
import {getMainXScale, getMainYScale} from './selectors/scales';
import {getTsTimeZone, getCurrentVariableUnitCode} from './selectors/time-series-data';


const getTsTooltipTextInfo = function(tsPoint, tsKey, unitCode, ianaTimeZone) {
    let label = '';
    if (tsPoint) {
        let valueStr = tsPoint.value !== null ? `${tsPoint.value} ${unitCode}` : ' ';
        const maskKeys = new Set(Object.keys(MASK_DESC));
        const qualifierKeysLower = new Set(tsPoint.qualifiers.map(x => x.toLowerCase()));
        const maskKeyIntersect = Array.from(qualifierKeysLower.values()).filter(x => maskKeys.has(x));

        if (maskKeyIntersect.length) {
            // a data point will have at most one masking qualifier
            valueStr = MASK_DESC[maskKeyIntersect[0]];
        }
        const timeLabel = DateTime.fromMillis(
            tsPoint.dateTime,
            {zone: ianaTimeZone}
        ).toFormat('MMM dd, yyyy hh:mm:ss a ZZZZ');
        label = `${valueStr} - ${timeLabel}`;
    }

    let classes = [`${tsKey}-tooltip-text`];
    let qualifierClasses = classesForPoint(tsPoint);
    if (qualifierClasses.approved) {
        classes.push('approved');
    }
    if (qualifierClasses.estimated) {
        classes.push('estimated');
    }
    return {
        label,
        classes
    };
};

const getGWLevelTextInfo = function(point, unitCode, ianaTimeZone) {
    if (!point) {
        return null;
    }
    const valueLabel = point.value !== null ? `${point.value} ${unitCode}` : ' ';
    const timeLabel = DateTime.fromMillis(point.dateTime, {zone: ianaTimeZone}).toFormat('MMM dd, yyyy hh:mm:ss a ZZZZ');
    return {
        label: `${valueLabel} - ${timeLabel}`,
        classes: ['gwlevel-tooltip-text']
    };
};

const createTooltipTextGroup = function(elem, {
    currentPoints,
    comparePoints,
    gwLevelPoint,
    unitCode,
    ianaTimeZone,
    layout
}, textGroup) {
    const adjustMarginOfTooltips = function(elem) {
        let marginAdjustment = layout.margin.left;
        elem.style('margin-left', marginAdjustment + 'px');
    };

    if (!textGroup) {
        textGroup = elem.append('div')
            .attr('class', 'tooltip-text-group')
            .call(adjustMarginOfTooltips);
    }
    const currentTooltipData = Object.values(currentPoints).map((tsPoint) => {
        return getTsTooltipTextInfo(tsPoint, 'current', unitCode, ianaTimeZone);
    });
    const compareTooltipData = Object.values(comparePoints).map((tsPoint) => {
        return getTsTooltipTextInfo(tsPoint, 'compare', unitCode, ianaTimeZone);
    });

    let tooltipTextData = currentTooltipData.concat(compareTooltipData);
    if (gwLevelPoint) {
        tooltipTextData.push(getGWLevelTextInfo(gwLevelPoint, unitCode, ianaTimeZone));
    }

    const texts = textGroup
        .selectAll('div')
        .data(tooltipTextData);

    // Remove old text labels
    texts.exit()
        .remove();

    // Add new text labels
    const newTexts = texts.enter()
        .append('div');

    // Update the text and backgrounds of all tooltip labels
    const allTexts = texts.merge(newTexts);
    allTexts
        .text(textData => textData.label)
        .attr('class', textData => textData.classes.join(' '));

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
        gwLevelPoint: getGroundwaterLevelCursorPoint,
        unitCode: getCurrentVariableUnitCode,
        ianaTimeZone: getTsTimeZone,
        layout: getMainLayout
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
        getGroundwaterLevelTooltipPoint,
        (current, compare, gwLevel) => {
            let points = current.concat(compare);
            if (gwLevel) {
                points.push(gwLevel);
            }
            return points;
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
