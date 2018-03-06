
const { max, bisector } = require('d3-array');
const { mouse } = require('d3-selection');
const memoize = require('fast-memoize');
const { createSelector, createStructuredSelector } = require('reselect');

const { dispatch, link } = require('../../lib/redux');

const { pointsSelector } = require('./timeseries');
const { Actions } = require('../../store');

const maxValue = function (data) {
    return max(data.map((datum) => datum.value));
};

const createFocusLine = function(elem, {yScale, currentTsData, compareTsData=null}) {
    let focus = elem.append('g')
        .attr('class', 'focus')
        .style('display', 'none');
    let compareMax = compareTsData ? maxValue(compareTsData) : 0;
    let yMax = max([maxValue(currentTsData), compareMax]);

    focus.append('line')
        .attr('class', 'focus-line')
        .attr('y1', yScale.range()[0])
        .attr('y2', yMax ? yScale(yMax) : yScale.range()[1]);
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
    const bisectDate = bisector(d => d.time).left;

    let index = bisectDate(data, time, 1);
    let datum;
    let d0 = data[index - 1];
    let d1 = data[index];

    if (d0 && d1) {
        datum = time - d0.time > d1.time - time ? d1 : d0;
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
 * @param {String} tsDataKey - Timeseries key
 * @return {Date}
 */
const tooltipFocusTimeSelector = memoize(tsDataKey => (state) => {
    return state.tooltipFocusTime[tsDataKey];
});

/*
 * Returns a function that the time series data point nearest the tooltip focus time for the given timeseries
 * @param {Object} state - Redux store
 * @param String} tsDataKey - Timeseries key
 * @return {Object}
 */
const tsDatumSelector = memoize(tsDataKey => createSelector(
    pointsSelector(tsDataKey),
    tooltipFocusTimeSelector(tsDataKey),
    (points, tooltipFocusTime) => {
        if (tooltipFocusTime && points && points.length) {
            return getNearestTime(points, tooltipFocusTime).datum;
        } else {
            return null;
        }
    })
);

const updateTooltipText = function(text, {datum}) {
    if (datum) {
        text.classed('approved', datum.approved)
            .classed('estimated', datum.estimated);
        text.text(datum.label);
    } else {
        text.text('');
    }
};

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
                datum: tsDatumSelector(tskey)
            })));
        y += 1;
    }
};

const updateFocusLine = function(elem, {currentTime, xScale}) {
    if (currentTime) {
        let x = xScale(currentTime);
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
                `translate(${xScale(tsDatum.time)}, ${yScale(tsDatum.value)})`);
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
const createTooltipFocus = function(elem, {xScale, yScale, compareXScale, currentTsData, compareTsData, isCompareVisible}) {
    elem.selectAll('.focus').remove();
    elem.select('.tooltip-text-group').remove();
    elem.select('.overlay').remove();

    if (!currentTsData) {
        return;
    }

    let focusLine = createFocusLine(elem, {
        yScale: yScale,
        currentTsData: currentTsData,
        compareTsData: isCompareVisible && compareTsData ? compareTsData : null
    });
    let focusCurrentCircle = createFocusCircle(elem);
    let focusCompareCircle = createFocusCircle(elem);

    focusLine.call(link(updateFocusLine, createStructuredSelector({
        currentTime: state => state.tooltipFocusTime['current'],
        xScale: () => xScale
    })));
    focusCurrentCircle.call(link(updateFocusCircle, createStructuredSelector({
        tsDatum : tsDatumSelector('current'),
        xScale: () => xScale,
        yScale: () => yScale
    })));
    focusCompareCircle.call(link(updateFocusCircle, createStructuredSelector({
        tsDatum: tsDatumSelector('compare'),
        xScale: () => compareXScale,
        yScale: () => yScale
    })));

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
};

module.exports = {getNearestTime, tooltipFocusTimeSelector, tsDatumSelector, createTooltipFocus, createTooltipText};
