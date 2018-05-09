
const { mouse, select } = require('d3-selection');
const { transition } = require('d3-transition');
const { timeFormat } = require('d3-time-format');
const memoize = require('fast-memoize');
const { createSelector, createStructuredSelector } = require('reselect');

const { dispatch, link, initAndUpdate } = require('../../lib/redux');
const { Actions } = require('../../store');

const { cursorTimeSelector, tsCursorPointsSelector } = require('./cursor');
const { classesForPoint, MASK_DESC } = require('./drawingData');
const { layoutSelector } = require('./layout');
const { xScaleSelector, yScaleSelector } = require('./scales');

const { getCurrentVariable } = require('../../selectors/timeSeriesSelector');

const formatTime = timeFormat('%b %-d, %Y, %-I:%M:%S %p');

const { USWDS_SMALL_SCREEN, USWDS_MEDIUM_SCREEN } = require('../../config'); // added for WDFN259
const { mediaQuery } = require('../../utils'); // added for WDFN259

const createFocusLine = function(elem) {
    let focus = elem.append('g')
        .attr('class', 'focus')
        .style('display', 'none');

    focus.append('line')
        .attr('class', 'focus-line');

    return focus;
};

const updateFocusLine = function(elem, {cursorTime, yScale, xScale}) {
    if (cursorTime) {
        const x = xScale(cursorTime);
        const range = yScale.range();

        elem.select('.focus-line')
            .attr('y1', range[0])
            .attr('y2', range[1])
            .attr('x1', x)
            .attr('x2', x);
        elem.style('display', null);
    } else {
        elem.style('display', 'none');
    }
};

/*
 * Returns a function that returns the time series data point nearest the
 * tooltip focus time for the given time series key. Only returns those points
 * where the y-value is finite; no use in making a point if y is Infinity.
 *
 * @param {Object} state - Redux store
 * @param String} tsKey - Time series key
 * @return {Object}
 */
const tooltipPointsSelector = memoize(tsKey => createSelector(
    xScaleSelector(tsKey),
    yScaleSelector,
    tsCursorPointsSelector(tsKey),
    (xScale, yScale, cursorPoints) => {
        return Object.keys(cursorPoints).reduce((tooltipPoints, tsID) => {
            const cursorPoint = cursorPoints[tsID];
            if (isFinite(yScale(cursorPoint.value))) {
                tooltipPoints.push({
                    x: xScale(cursorPoint.dateTime),
                    y: yScale(cursorPoint.value),
                    tsID
                });
            }
            return tooltipPoints;
        }, []);
    }
));

const getTooltipText = function(datum, qualifiers, unitCode) {
    let label = '';
    if (datum && qualifiers) {
        const tzAbbrev = datum.dateTime.toString().match(/\(([^)]+)\)/)[1];
        let valueStr = datum.value === null ? ' ' : `${datum.value} ${unitCode}`;

        const maskKeys = new Set(Object.keys(MASK_DESC));
        const qualiferKeysLower = new Set(datum.qualifiers.map(x => x.toLowerCase()));
        const maskKeyIntersect = [...qualiferKeysLower].filter(x => maskKeys.has(x));

        if (maskKeyIntersect.length) {
            // a data point will have at most one masking qualifier
            valueStr = MASK_DESC[[maskKeyIntersect][0]];
        }
        label = `${valueStr} - ${formatTime(datum.dateTime)} ${tzAbbrev}`;
    }

    return label;
};

const qualifiersSelector = state => state.series.qualifiers;

const unitCodeSelector = createSelector(
    getCurrentVariable,
    variable => variable ? variable.unit.unitCode : null
);

// start added for WDFN259

// set number of pixels to bump the tooltips away from y-axis
let baseMarginOffsetTextGroup = 5;
let marginAdjustment = baseMarginOffsetTextGroup + 0;
// Find the with of the between the y-axis and margin
const findWidthYAxisAndMargin = function (elem) {
    elem.call(link(function(elem, layout) {
        return marginAdjustment =  layout.margin.left;
        }, layoutSelector));
};

/*
 * Adjust font size of tooltips based on number of tooltips showing
 * @param {elem} Object - D3 selector
 */
const adjustTooltipFontSize = function(elem) {
    console.log('here');
    const tooltipTotal = Number(document.querySelectorAll('.tooltip-text-group .current-tooltip-text').length)
        + Number(document.querySelectorAll('.tooltip-text-group .compare-tooltip-text').length);
    if (mediaQuery(USWDS_MEDIUM_SCREEN)) {
        if (tooltipTotal <= 2) {
            elem.style('font-size', '2rem');
        } else if (tooltipTotal <= 4) {
            elem.style('font-size', '1.75rem');
        } else {
            elem.style('font-size', '1.25rem');
        }
    } else if (mediaQuery(USWDS_SMALL_SCREEN)) {
        if (tooltipTotal <= 2) {
            elem.style('font-size', '1.75rem');
        } else if (tooltipTotal <= 4) {
            elem.style('font-size', '1.25rem');
        } else {
            elem.style('font-size', '1rem');
        }
    } else {
        elem.style('font-size', '1rem');
    }
}
// end added for WDFN259

const createTooltipTextGroup = function (elem, {currentPoints, comparePoints, qualifiers, unitCode}, textGroup) {

    // Put the circles in a container so we can keep the their position in the
    // DOM before rect.overlay, to prevent the circles from receiving mouse
    // events.
    if (!textGroup) {
        textGroup = elem.append('div')
      // original line      .attr('class', 'tooltip-text-group')
     // moved       .attr('class', d => `${d.tsKey}-tooltip-text`);
            .attr('class', 'tooltip-text-group'); // modified for WDFN259
    }

    const data = Object.values(currentPoints).concat(Object.values(comparePoints));

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

    // Update the text and backgrounds of all tooltip labels
    const merge = texts.merge(newTexts)
        .interrupt()
        .style('opacity', '1')
        .call(findWidthYAxisAndMargin)  // added for WDFN259
        .call(adjustTooltipFontSize)  // added for WDFN259
        .style('margin-left', marginAdjustment + 'px'); // added for WDFN259

    merge
        .text(datum => getTooltipText(datum, qualifiers, unitCode))
        .each(function (datum) {
            const classes = classesForPoint(datum);
            const text = select(this);
            text.attr('class', d => `${d.tsKey}-tooltip-text`); // moved for WFDN259
            text.classed('approved', classes.approved);
            text.classed('estimated', classes.estimated);
        });

    return textGroup;
};


/*
 * Append a group containing the tooltip text elements to elem
 * @param {Object} elem - D3 selector
 */
const createTooltipText = function (elem) {
    elem.call(link(createTooltipTextGroup, createStructuredSelector({
        currentPoints: tsCursorPointsSelector('current'),
        comparePoints: tsCursorPointsSelector('compare'),
        qualifiers: qualifiersSelector,
        unitCode: unitCodeSelector,
        layout: layoutSelector
    })));
};

const createFocusCircles = function (elem, tooltipPoints, circleContainer) {
    // Put the circles in a container so we can keep the their position in the
    // DOM before rect.overlay, to prevent the circles from receiving mouse
    // events.
    circleContainer = circleContainer || elem.append('g');

    const circles = circleContainer
        .selectAll('circle.focus')
        .data(tooltipPoints, d => d.tsID);

    // Remove old circles after fading them out
    circles.exit()
        .transition(transition().duration(500))
            .style('opacity', '0')
            .remove();

    // Add new focus circles
    const newCircles = circles.enter()
        .append('circle')
            .attr('class', 'focus')
            .attr('r', 5.5);

    // Update the location of all circles
    circles.merge(newCircles)
        .transition(transition().duration(20))
            .style('opacity', '.6')
            .attr('transform', (tsDatum) => `translate(${tsDatum.x}, ${tsDatum.y})`);

    return circleContainer;
};

/*
 * Appends a group to elem containing a focus line and circles for the current and compare time series
 * @param {Object} elem - D3 select
 * @param {Object} xScale - D3 X scale for the current time series
 * @param {Object} yScale - D3 Y scale for the graph
 * @param {Object} compareXScale - D3 X scale for the compate time series
 * @param {Array} currentTsData - current time series points
 * @param {Array} compareTsData - compare time series points
 * @param {Boolean} isCompareVisible
 */
const createTooltipFocus = function(elem) {
    elem.call(link(initAndUpdate(createFocusLine, updateFocusLine), createStructuredSelector({
        xScale: xScaleSelector('current'),
        yScale: yScaleSelector,
        cursorTime: cursorTimeSelector('current')
    })));

    elem.call(link(createFocusCircles, createSelector(
        tooltipPointsSelector('current'),
        tooltipPointsSelector('compare'),
        (current, compare) => {
            return current.concat(compare);
        }
    )));

    elem.call(link(function (elem, {xScale, layout}) {
        elem.select('.overlay').remove();
        elem.append('rect')
            .attr('class', 'overlay')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', layout.width - layout.margin.right)
            .attr('height', layout.height - (layout.margin.top + layout.margin.bottom))
            .on('mouseover', dispatch(function() {
                const selectedTime = xScale.invert(mouse(elem.node())[0]).getTime();
                const startTime = xScale.domain()[0].getTime();
                return Actions.setCursorOffset(selectedTime - startTime);
            }))
            .on('mouseout', dispatch(function() {
                return Actions.setCursorOffset(null);
            }))
            .on('mousemove', dispatch(function() {
                const selectedTime = xScale.invert(mouse(elem.node())[0]).getTime();
                const startTime = xScale.domain()[0].getTime();
                return Actions.setCursorOffset(selectedTime - startTime);
            }));
    }, createStructuredSelector({
        xScale: xScaleSelector('current'),
        layout: layoutSelector
    })));
};

module.exports = {createTooltipFocus, createTooltipText, tooltipPointsSelector};
