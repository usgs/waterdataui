
const { mouse, select } = require('d3-selection');
const { transition } = require('d3-transition');
const { timeFormat } = require('d3-time-format');
const memoize = require('fast-memoize');
const { createSelector, createStructuredSelector } = require('reselect');

const { dispatch, link, initAndUpdate } = require('../../lib/redux');
const { Actions } = require('../../store');
const { wrap } = require('../../utils');

const { cursorTimeSelector, tsCursorPointsSelector } = require('./cursor');
const { classesForPoint, MASK_DESC } = require('./drawingData');
const { layoutSelector } = require('./layout');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { currentVariableSelector } = require('./timeseries');

const formatTime = timeFormat('%b %-d, %Y, %-I:%M:%S %p');


const createFocusLine = function(elem, {yScale}) {
    let focus = elem.append('g')
        .attr('class', 'focus')
        .style('display', 'none');

    const range = yScale.range();
    focus.append('line')
        .attr('class', 'focus-line')
        .attr('y1', range[0])
        .attr('y2', range[1]);

    return focus;
};

const updateFocusLine = function(elem, {cursorTime, xScale}) {
    if (cursorTime) {
        let x = xScale(cursorTime);
        elem.select('.focus-line').attr('x1', x).attr('x2', x);
        elem.style('display', null);
    } else {
        elem.style('display', 'none');
    }
};

/*
 * Returns a function that returns the time series data point nearest the
 * tooltip focus time for the given time series key.
 * @param {Object} state - Redux store
 * @param String} tsKey - Timeseries key
 * @return {Object}
 */
const tooltipPointsSelector = memoize(tsKey => createSelector(
    xScaleSelector(tsKey),
    yScaleSelector,
    tsCursorPointsSelector(tsKey),
    (xScale, yScale, cursorPoints) => {
        return Object.keys(cursorPoints).reduce((tooltipPoints, tsID) => {
            const cursorPoint = cursorPoints[tsID];
            tooltipPoints.push({
                x: xScale(cursorPoint.dateTime),
                y: yScale(cursorPoint.value),
                tsID
            });
            return tooltipPoints;
        }, []);
    }
));

const getTooltipText = function(datum, qualifiers, unitCode) {
    let label = '';
    if (datum && qualifiers) {
        let tzAbbrev = datum.dateTime.toString().match(/\(([^)]+)\)/)[1];
        const maskKeys = new Set(Object.keys(MASK_DESC));
        const qualiferKeysLower = new Set(datum.qualifiers.map(x => x.toLowerCase()));
        const keyIntersect = [...qualiferKeysLower].filter(x => maskKeys.has(x));
        const qualifierStr = Object.keys(qualifiers).filter(
            key => datum.qualifiers.indexOf(key) > -1 && !maskKeys.has(key.toLowerCase())).map(
                key => qualifiers[key].qualifierDescription).join(', ');
        let valueStr = datum.value === null ? ' ' : `${datum.value} ${unitCode}`;
        if (valueStr.trim().length === 0 && keyIntersect) {
            // a data point will have at most one masking qualifier
            valueStr = MASK_DESC[[keyIntersect][0]];
        }
        label = `${valueStr} - ${formatTime(datum.dateTime)} ${tzAbbrev} (${qualifierStr})`;
    }

    return label;
};

const qualifiersSelector = state => state.series.qualifiers;

const unitCodeSelector = createSelector(
    currentVariableSelector,
    variable => variable ? variable.unit.unitCode : null
);

const createTooltipTextGroup = function (elem, {currentPoints, comparePoints, qualifiers, unitCode, layout}, textGroup) {
    const tooltipPaddingPx = layout.margin.left / 2;

    // Put the circles in a container so we can keep the their position in the
    // DOM before rect.overlay, to prevent the circles from receiving mouse
    // events.
    let resizeBackground = true;
    if (!textGroup) {
        resizeBackground = false;
        textGroup = elem.append('g')
            .attr('class', 'tooltip-text-group');
        textGroup.append('rect')
            .attr('class', 'tooltip-text-group-background')
            .attr('x', 0)
            .attr('y', 0);
    }

    const data = Object.values(currentPoints).concat(Object.values(comparePoints));
    const texts = textGroup
        .selectAll('.series-text')
        .data(data);

    // Remove old text labels after fading them out
    texts.exit()
        .transition(transition().duration(500))
            .style('opacity', '0')
            .remove();

    // Add new text labels
    const newTexts = texts.enter()
        .append('g')
            .attr('class', 'series-text')
            .call(g => {
                g.append('rect')
                    .attr('class', 'tooltip-text-background')
                    .attr('width', 0)
                    .attr('height', 0)
                    .attr('x', tooltipPaddingPx);
                g.append('text')
                    .attr('class', d => `${d.tsKey}-tooltip-text`)
                    .attr('height', '1.1em')
                    .attr('x', tooltipPaddingPx);
            });

    // Update the text and backgrounds of all tooltip labels
    const merge = texts.merge(newTexts)
        .interrupt()
        .style('opacity', '1');
    merge.select('text')
        .attr('y', (d, i) => `${(i + 1) * 1.1}em`)
        .text(datum => {
            return getTooltipText(datum, qualifiers, unitCode);
        })
        .call(wrap, layout.width - (2 * tooltipPaddingPx))
        .each(function (datum) {
            const classes = classesForPoint(datum);
            const text = select(this);
            text.classed('approved', classes.approved);
            text.classed('estimated', classes.estimated);
        })
        .classed('approved', datum => {
            return classesForPoint(datum).approved;
        })
        .classed('estimated', datum => classesForPoint(datum).estimated);
    merge.select('text')
        .each(function (text) {
            const bBox = this.getBBox();
            select(this.parentNode)
                .select('.tooltip-text-background')
                    .attr('y', bBox.y)
                    .attr('width', bBox.width)
                    .attr('height', bBox.height);
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
