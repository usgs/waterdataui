import {set} from 'd3-collection';
import {select} from 'd3-selection';
import {transition} from 'd3-transition';
import memoize from 'fast-memoize';
import {DateTime} from 'luxon';
import {createSelector, createStructuredSelector} from 'reselect';

import config from '../../config';
import {drawCursorSlider} from '../../d3-rendering/cursor-slider';
import {drawFocusOverlay, drawFocusCircles, drawFocusLine} from '../../d3-rendering/graph-tooltip';
import {link} from '../../lib/d3-redux';
import {getCurrentVariable, getCurrentParmCd} from '../../selectors/time-series-selector';
import {Actions} from '../../store/instantaneous-value-time-series-state';
import {mediaQuery, convertCelsiusToFahrenheit, convertFahrenheitToCelsius} from '../../utils';

import {cursorTimeSelector, tsCursorPointsSelector} from './cursor';
import {classesForPoint, MASK_DESC} from './drawing-data';
import {getMainLayout} from './layout';
import {getMainXScale, getMainYScale} from './scales';
import {tsTimeZoneSelector, TEMPERATURE_PARAMETERS} from './time-series';


/*
 * Returns a function that returns the time series data point nearest the
 * tooltip focus time for the given time series key. Only returns those points
 * where the y-value is finite; no use in making a point if y is Infinity.
 *
 * @param {Object} state - Redux store
 * @param String} tsKey - Time series key
 * @return {Object}
 */
export const tooltipPointsSelector = memoize(tsKey => createSelector(
    getMainXScale(tsKey),
    getMainYScale,
    tsCursorPointsSelector(tsKey),
    (xScale, yScale, cursorPoints) => {
        return Object.keys(cursorPoints).reduce((tooltipPoints, tsID) => {
            const cursorPoint = cursorPoints[tsID];
            if (isFinite(yScale(cursorPoint.value))) {
                tooltipPoints.push({
                    x: xScale(cursorPoint.dateTime),
                    y: yScale(cursorPoint.value)
                });
            }
            return tooltipPoints;
        }, []);
    }
));

const getTooltipText = function(datum, qualifiers, unitCode, ianaTimeZone, currentParmCd) {
    let label = '';
    if (datum && qualifiers) {
        let valueStr = datum.value === null ? ' ' : `${datum.value} ${unitCode}`;
        const maskKeys = set(Object.keys(MASK_DESC));
        const qualiferKeysLower = set(datum.qualifiers.map(x => x.toLowerCase()));
        const maskKeyIntersect = [...qualiferKeysLower.values()].filter(x => maskKeys.has(x));
        if (valueStr !== ' ') {
            let convertedValue;
            let convertedUnit;
            if (TEMPERATURE_PARAMETERS.celsius.includes(currentParmCd)) {
                convertedValue = convertCelsiusToFahrenheit(datum.value);
                convertedUnit = 'deg F';
            } else if (TEMPERATURE_PARAMETERS.fahrenheit.includes(currentParmCd)) {
                convertedValue = convertFahrenheitToCelsius(datum.value);
                convertedUnit = 'deg C';
            }
            if (convertedValue) {
                const secondaryAxisValue = `${convertedValue.toFixed(1)} ${convertedUnit}`;
                valueStr += ` (${secondaryAxisValue})`;
            }
        }
        if (maskKeyIntersect.length) {
            // a data point will have at most one masking qualifier
            valueStr = MASK_DESC[[maskKeyIntersect][0]];
        }
        const timeLabel = DateTime.fromMillis(
            datum.dateTime,
            {zone: ianaTimeZone}
        ).toFormat('MMM dd, yyyy hh:mm:ss a ZZZZ');
        label = `${valueStr} - ${timeLabel}`;
    }

    return label;
};

const qualifiersSelector = state => state.ivTimeSeriesData.qualifiers;

const unitCodeSelector = createSelector(
    getCurrentVariable,
    variable => variable ? variable.unit.unitCode : null
);

const createTooltipTextGroup = function (elem, {currentPoints, comparePoints, qualifiers, unitCode, ianaTimeZone, layout, currentParmCd}, textGroup) {
    // Find the width of the between the y-axis and margin and set the tooltip margin based on that number
    const adjustMarginOfTooltips = function (elem) {
        // set a base number of pixels to bump the tooltips away from y-axis and compensate for slight under reporting
        // of margin width by layout selector on time series with single or double digits on y-axis
        const baseMarginOffsetTextGroup = 27;
        let marginAdjustment = layout.margin.left + baseMarginOffsetTextGroup;
        elem.style('margin-left', marginAdjustment + 'px');
    };
    const currentPointsWithMethod = Object.keys(currentPoints).map((tsKey) => {
        const methodID = tsKey.split(':')[0];
        return {
            ...currentPoints[tsKey],
            methodID: methodID
        };
    });
    const comparePointsWithMethod = Object.keys(comparePoints).map((tsKey) => {
        const methodID = tsKey.split(':')[0];
        return {
            ...comparePoints[tsKey],
            methodID: methodID
        };
    });

    if (!textGroup) {
        textGroup = elem.append('div')
            .attr('class', 'tooltip-text-group')
            .call(adjustMarginOfTooltips);
    }

    const data = Object.values(currentPointsWithMethod).concat(Object.values(comparePointsWithMethod));
    const texts = textGroup
        .selectAll('div')
        .data(data);

    // Remove old text labels after fading them out
    texts.exit()
        .transition(transition().duration(500))
            .style('opacity', '0')
            .remove();

    // Add new text labels
    const newTexts = texts.enter()
        .append('div');

    // find how many tooltips are showing and adjust the font size larger if there are few, smaller if there are many
    const adjustTooltipFontSize = function() {
        const totalTooltipsShowing = Object.values(currentPoints).length + Object.values(comparePoints).length;
        let tooltipFontSize = 0;
        if (mediaQuery(config.USWDS_MEDIUM_SCREEN)) {
            if (totalTooltipsShowing <= 2) {
                tooltipFontSize = 1.25;
            } else if (totalTooltipsShowing <= 4) {
                tooltipFontSize = 1;
            } else {
               tooltipFontSize = 0.8;
            }
        } else if (mediaQuery(config.USWDS_SMALL_SCREEN)) {
            if (totalTooltipsShowing <= 2) {
                tooltipFontSize = 1.1;
            } else if (totalTooltipsShowing <= 4) {
                tooltipFontSize = .9;
            } else {
                tooltipFontSize = 0.8;
            }
        } else {
            tooltipFontSize = 0.8;
        }
        textGroup.style('font-size', tooltipFontSize + 'rem');
    };

    // Update the text and backgrounds of all tooltip labels
    const merge = texts.merge(newTexts)
        .interrupt()
        .call(adjustTooltipFontSize);

    merge
        .text(datum => getTooltipText(datum, qualifiers, unitCode, ianaTimeZone, currentParmCd))
        .each(function (datum) {
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
export const drawTooltipText = function (elem, store) {
    elem.call(link(store, createTooltipTextGroup, createStructuredSelector({
        currentPoints: tsCursorPointsSelector('current'),
        comparePoints: tsCursorPointsSelector('compare'),
        qualifiers: qualifiersSelector,
        unitCode: unitCodeSelector,
        layout: getMainLayout,
        ianaTimeZone: tsTimeZoneSelector,
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
        cursorTime: cursorTimeSelector('current')
    })));

    elem.call(link(store, drawFocusCircles, createSelector(
        tooltipPointsSelector('current'),
        tooltipPointsSelector('compare'),
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