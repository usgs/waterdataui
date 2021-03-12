import {DateTime} from 'luxon';
import {createSelector, createStructuredSelector} from 'reselect';

import config from 'ui/config';
import {link} from 'ui/lib/d3-redux';

import {drawCursorSlider} from 'd3render/cursor-slider';
import {drawFocusOverlay, drawFocusCircles, drawFocusLine} from 'd3render/graph-tooltip';

import {getPrimaryParameter} from 'ml/selectors/hydrograph-data-selector';
import {getGraphCursorOffset} from 'ml/selectors/hydrograph-state-selector';
import {setGraphCursorOffset} from 'ml/store/hydrograph-state';

import {getCursorTime, getIVDataCursorPoint, getIVDataTooltipPoint, getGroundwaterLevelCursorPoint,
    getGroundwaterLevelTooltipPoint
} from './selectors/cursor';
import {getMainLayout} from './selectors/layout';
import {getMainXScale, getMainYScale} from './selectors/scales';


const getIVDataTooltipTextInfo = function(point, dataKind, unitCode) {
    const timeLabel = DateTime.fromMillis(
            point.dateTime,
            {zone: config.locationTimeZone}
        ).toFormat('MMM dd, yyyy hh:mm:ss a ZZZZ');
    const valueLabel = point.isMasked ? point.label : `${point.value} ${unitCode}`;
    return {
        label: `${valueLabel} - ${timeLabel}`,
        classes: [`${dataKind}-tooltip-text`, point.class]
    };
};

const getGWLevelTextInfo = function(point, unitCode) {
    if (!point) {
        return null;
    }
    const valueLabel = point.value !== null ? `${point.value} ${unitCode}` : ' ';
    const timeLabel = DateTime.fromMillis(point.dateTime, {zone: config.locationTimeZone}).toFormat('MMM dd, yyyy hh:mm:ss a ZZZZ');
    return {
        label: `${valueLabel} - ${timeLabel}`,
        classes: point.classes
    };
};

const createTooltipTextGroup = function(elem, {
    currentPoint,
    comparePoint,
    gwLevelPoint,
    parameter,
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
    const unitCode = parameter ? parameter.unit : '';

    let tooltipTextData = [];
    if (currentPoint) {
        tooltipTextData.push(getIVDataTooltipTextInfo(currentPoint, 'primary', unitCode));
    }
    if(comparePoint) {
        tooltipTextData.push(getIVDataTooltipTextInfo(comparePoint, 'compare', unitCode));
    }
    if (gwLevelPoint) {
        tooltipTextData.push(getGWLevelTextInfo(gwLevelPoint, unitCode));
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
        .text(textData => {
            return textData.label;
        })
        .attr('class', textData => textData.classes.join(' '));

    return textGroup;
};


/*
 * Append a group containing the tooltip text elements to elem
 * @param {Object} elem - D3 selector
 */
export const drawTooltipText = function(elem, store) {
    elem.call(link(store, createTooltipTextGroup, createStructuredSelector({
        currentPoint: getIVDataCursorPoint('primary', 'current'),
        comparePoint: getIVDataCursorPoint('compare', 'prioryear'),
        gwLevelPoint: getGroundwaterLevelCursorPoint,
        parameter: getPrimaryParameter,
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
        getIVDataTooltipPoint('primary', 'current'),
        getIVDataTooltipPoint('compare', 'prioryear'),
        getGroundwaterLevelTooltipPoint,
        (current, compare, gwLevel) => {
            let points = [];
            if (current) {
                points.push(current);
            }
            if (compare) {
                points.push(compare);
            }
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
        setGraphCursorOffset)
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
            cursorOffset: getGraphCursorOffset,
            xScale: getMainXScale('current'),
            layout: getMainLayout
        }), store, setGraphCursorOffset));
};
