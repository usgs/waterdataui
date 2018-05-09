
const { mouse, select } = require('d3-selection');
const { transition } = require('d3-transition');
const { timeFormat } = require('d3-time-format');
const memoize = require('fast-memoize');
const { createSelector, createStructuredSelector } = require('reselect');
const { DateTime } = require('luxon');

const { dispatch, link, initAndUpdate } = require('../../lib/redux');
const { Actions } = require('../../store');

const { cursorTimeSelector, tsCursorPointsSelector } = require('./cursor');
const { classesForPoint, MASK_DESC } = require('./drawingData');
const { layoutSelector } = require('./layout');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { tsTimeZoneSelector } = require('./timeSeries');

const { getCurrentVariable } = require('../../selectors/timeSeriesSelector');

const formatTime = timeFormat('%b %-d, %Y, %-I:%M:%S %p');


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

const getTooltipText = function(datum, qualifiers, unitCode, ianaTimeZone) {
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
        const timeLabel = DateTime.fromJSDate(
            datum.dateTime,
            {zone: ianaTimeZone}
        ).toFormat('MMM dd, yyyy hh:mm:ss a ZZZZ');
        label = `${valueStr} - ${timeLabel}`;
    }

    return label;
};

const qualifiersSelector = state => state.series.qualifiers;

const unitCodeSelector = createSelector(
    getCurrentVariable,
    variable => variable ? variable.unit.unitCode : null
);

const createTooltipTextGroup = function (elem, {currentPoints, comparePoints, qualifiers, unitCode, ianaTimeZone}, textGroup) {

    // Put the circles in a container so we can keep the their position in the
    // DOM before rect.overlay, to prevent the circles from receiving mouse
    // events.
    if (!textGroup) {
        textGroup = elem.append('div')
            .attr('class', 'tooltip-text-group');
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
        .append('div')
            .attr('class', d => `${d.tsKey}-tooltip-text`);

    // Update the text and backgrounds of all tooltip labels
    const merge = texts.merge(newTexts)
        .interrupt()
        .style('opacity', '1');
    merge
        .text(datum => getTooltipText(datum, qualifiers, unitCode, ianaTimeZone))
        .each(function (datum) {
            const classes = classesForPoint(datum);
            const text = select(this);
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
        layout: layoutSelector,
        ianaTimeZone: tsTimeZoneSelector
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
