
const { bisector } = require('d3-array');
const { mouse } = require('d3-selection');
const { timeFormat } = require('d3-time-format');
const memoize = require('fast-memoize');
const { createSelector, createStructuredSelector } = require('reselect');

const { dispatch, link, createOrUpdate } = require('../../lib/redux');

const { cursorLocationSelector } = require('./cursor');
const { classesForPoint, currentVariablePointsSelector, pointsSelector, MASK_DESC } = require('./drawingData');
const { xScaleSelector, yScaleSelector } = require('./scales');
const { currentVariableSelector, currentVariableTimeSeriesSelector, isVisibleSelector } = require('./timeseries');
const { Actions } = require('../../store');

const formatTime = timeFormat('%b %-d, %Y, %-I:%M:%S %p');


const createFocusLine = function(elem, {yScale}) {
    let focus = elem.append('g')
        .attr('class', 'focus')
        .style('display', 'none');

    focus.append('line')
        .attr('class', 'focus-line')
        .attr('y1', yScale.range()[0])
        .attr('y2', yScale.range()[1]);

    return focus;
};

const createFocusCircle = function(elem) {
    let focus = elem.append('g')
        .attr('class', 'focus')
        .style('display', 'none');
    focus.append('circle')
        .attr('r', 5.5);
    return focus;
};


/*
 * Return the data point nearest to time and its index.
 * @param {Array} data - array of Object where one of the keys is time.
 * @param {Date} time
 * @return {Object} - datum and index
 */
const getNearestTime = function(data, time) {
    // Function that returns the left bounding point for a given chart point.
    if (data.length < 2) {
        return null;
    }
    const bisectDate = bisector(d => d.dateTime).left;

    let index = bisectDate(data, time, 1);
    let datum;
    let d0 = data[index - 1];
    let d1 = data[index];

    if (d0 && d1) {
        datum = time - d0.dateTime > d1.dateTime - time ? d1 : d0;
    } else {
        datum = d0 || d1;
    }

    // Return the nearest data point and its index.
    return {
        datum,
        index: datum === d0 ? index - 1 : index
    };
};
/*
 * Returns a function that returns the tooltipFocus time for a given timeseries
 * @param {Object} state - Redux store
 * @param {String} tsKey - Timeseries key
 * @return {Date}
 */
const tooltipFocusTimeSelector = memoize(tsKey => createSelector(
    state => state.tooltipFocusTime,
    tooltipFocusTime => tooltipFocusTime[tsKey]
));

/*
 * Returns a function that the time series data point nearest the tooltip focus time for the given timeseries
 * @param {Object} state - Redux store
 * @param String} tsKey - Timeseries key
 * @return {Object}
 */
export const tsDatumSelector = memoize(tsKey => createSelector(
    currentVariablePointsSelector(tsKey),
    tooltipFocusTimeSelector(tsKey),
    (points, tooltipFocusTime) => {
        // FIXME: Handle more than just the first time series in the list
        points = points[0];

        if (tooltipFocusTime && points && points.length) {
            return getNearestTime(points, tooltipFocusTime).datum;
        } else {
            return null;
        }
    })
);

/*
 * Returns a function that the time series data point nearest the tooltip focus time for the given timeseries
 * @param {Object} state - Redux store
 * @param String} tsKey - Timeseries key
 * @return {Object}
 */
export const tsDatumsSelector = memoize(tsKey => createSelector(
    currentVariableTimeSeriesSelector(tsKey),
    tooltipFocusTimeSelector(tsKey),
    (timeSeries, tooltipFocusTime) => {
        if (!tooltipFocusTime) {
            return null;
        }

        return Object.keys(timeSeries).reduce((data, tsId) => {
            data[tsId] = getNearestTime(timeSeries[tsId].points, tooltipFocusTime).datum;
            return data;
        }, {});
    })
);

const updateTooltipText = function(text, {datum, qualifiers, unitCode}) {
    let label = '';
    let classes = {};
    if (datum) {
        if (!qualifiers) {
            return;
        }
        let tzAbbrev = datum.dateTime.toString().match(/\(([^)]+)\)/)[1];
        const maskKeys = new Set(Object.keys(MASK_DESC));
        const qualiferKeysLower = new Set(datum.qualifiers.map(x => x.toLowerCase()));
        const keyIntersect = [...qualiferKeysLower].filter(x => maskKeys.has(x));
        const qualifierStr = Object.keys(qualifiers).filter(
            key => datum.qualifiers.indexOf(key) > -1 && !maskKeys.has(key.toLowerCase())).map(
                key => qualifiers[key].qualifierDescription).join(', ');
        let valueStr = `${datum.value || ''} ${datum.value ? unitCode : ''}`;
        if (valueStr.trim().length === 0 && keyIntersect) {
            // a data point will have at most one masking qualifier
            valueStr = MASK_DESC[[keyIntersect][0]];
        }
        label = `${valueStr} - ${formatTime(datum.dateTime)} ${tzAbbrev} (${qualifierStr})`;
        classes = classesForPoint(datum);
    }

    text.classed('approved', classes.approved)
        .classed('estimated', classes.estimated);
    text.text(label);
};

const qualifiersSelector = state => state.series.qualifiers;

const unitCodeSelector = createSelector(
    currentVariableSelector,
    variable => variable ? variable.unit.unitCode : null
);


/*
 * Append a group containing the tooltip text elements to elem
 * @param {Object} elem - D3 selector
 */
const createTooltipText = function(elem) {
    const tskeys = ['current', 'compare'];
    let tooltipTextGroup = elem.append('g')
        .attr('class', 'tooltip-text-group')
        .attr('width', '100%')
        .attr('height', '20%');
    let y = 1;
    for (let tskey of tskeys) {
        tooltipTextGroup.append('text')
            .attr('class', `${tskey}-tooltip-text`)
            .attr('x', 20)
            .attr('y', `${y}em`)
            .call(link(updateTooltipText, createStructuredSelector({
                datum: tsDatumSelector(tskey),
                qualifiers: qualifiersSelector,
                unitCode: unitCodeSelector
            })));
        y += 1;
    }
};

const updateFocusLine = function(elem, {cursorLocation, xScale}) {
    if (cursorLocation) {
        let x = xScale(cursorLocation);
        elem.select('.focus-line').attr('x1', x).attr('x2', x);
        elem.style('display', null);
    } else {
        elem.style('display', 'none');
    }
};

const updateFocusCircle = function(circleFocus, {tsDatum, xScale, yScale}) {
    if (tsDatum && tsDatum.value) {
        circleFocus.style('display', null)
            .attr('transform',
                `translate(${xScale(tsDatum.dateTime)}, ${yScale(tsDatum.value)})`);
    } else {
        circleFocus.style('display', 'none');
    }
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
    elem.call(link(createOrUpdate(createFocusLine, updateFocusLine), createStructuredSelector({
        xScale: xScaleSelector('current'),
        yScale: yScaleSelector,
        cursorLocation: cursorLocationSelector,
        currentTsData: pointsSelector('current'),
        compareTsData: pointsSelector('compare')
    })));

    elem.call(link(createOrUpdate(createFocusCircle, updateFocusCircle), createStructuredSelector({
        tsDatum: tsDatumSelector('current'),
        xScale: xScaleSelector('current'),
        yScale: yScaleSelector
    })));

    elem.call(link(createOrUpdate(createFocusCircle, updateFocusCircle), createStructuredSelector({
        tsDatum: tsDatumSelector('compare'),
        xScale: xScaleSelector('compare'),
        yScale: yScaleSelector
    })));

    elem.call(link(function (elem, {xScale, compareXScale, isCompareVisible}) {
        elem.select('.overlay').remove();
        elem.append('rect')
            .attr('class', 'overlay')
            .attr('width', '100%')
            .attr('height', '100%')
            .on('mouseover', dispatch(function() {
                return Actions.setTooltipTime(
                    xScale.invert(mouse(elem.node())[0]),
                    isCompareVisible ? compareXScale.invert(mouse(elem.node())[0]) : null
                );
            }))
            .on('mouseout', dispatch(function() {
                return Actions.setTooltipTime(null, null);
            }))
            .on('mousemove', dispatch(function() {
                return Actions.setTooltipTime(
                    xScale.invert(mouse(elem.node())[0]),
                    isCompareVisible ? compareXScale.invert(mouse(elem.node())[0]) : null
                );
            }));
    }, createStructuredSelector({
        xScale: xScaleSelector('current'),
        compareXScale: xScaleSelector('compare'),
        isCompareVisible: isVisibleSelector('compare')
    })));
};

module.exports = {getNearestTime, tooltipFocusTimeSelector, tsDatumSelector, createTooltipFocus, createTooltipText};
