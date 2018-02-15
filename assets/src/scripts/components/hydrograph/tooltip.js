
const { max, bisector } = require('d3-array');
const { mouse } = require('d3-selection');
const { createSelector, createStructuredSelector, defaultMemoize: memoize } = require('reselect');

const { dispatch, link } = require('../../lib/redux');

const { pointsSelector } = require('./points');
const { Actions } = require('./store');

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
        .attr('y2', yMax !== 0 ? yScale(yMax) : yScale.range()[1]);
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

const tooltipTimeSelector = memoize(tsDataKey => (state) => {
    return state.tsTooltipTime[tsDataKey];
});

const tsDatumSelector = memoize(tsDataKey => createSelector(
    pointsSelector(tsDataKey),
    tooltipTimeSelector(tsDataKey),
    (points, tsTooltipTime) => {
        if (tsTooltipTime) {
            return getNearestTime(points, tsTooltipTime).datum;
        } else {
            return null;
        }
    })
);

const tooltipText = function(text, {datum}) {
    if (datum) {
        text.classed('approved', datum.approved)
            .classed('estimated', datum.estimated);
        text.html(datum.label);
    } else {
        text.html('Hello');
    }
};

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
            .call(link(tooltipText, createStructuredSelector({
                datum: tsDatumSelector(tskey)
            })));
        y += 1;
    }
};

const updateFocusLine = function(elem, {currentTime, xScale}) {
    let x = xScale(currentTime);
    elem.select('.focus-line')
        .attr('x1', x)
        .attr('x2', x);
};

const updateFocusCircle = function(circleFocus, {tsDatum, xScale, yScale}) {
    if (tsDatum) {
        circleFocus.style('display', null)
            .attr('transform',
                `translate(${xScale(tsDatum.time)}, ${yScale(tsDatum.value)})`);
    } else {
        circleFocus.style('display', 'none');
    }
};


const createTooltip = function(elem, {xScale, yScale, compareXScale, currentTsData, compareTsData, isCompareVisible}) {
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
        currentTime: state => state.tsTooltipTime['current'],
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
        .on('mouseover', () => {
            focusLine.style('display', null);
            focusCurrentCircle.style('display', null);
            if (isCompareVisible) {
                focusCompareCircle.style('display', null);
            }
            //tooltipText.style('display', null);
        })
        .on('mouseout', () => {
            focusLine.style('display', 'none');
            focusCurrentCircle.style('display', 'none');
            focusCompareCircle.style('display', 'none');
            //tooltipText.style('display', 'none');
        })
        .on('mousemove', dispatch(function() {
            return Actions.setTooltipTime(
                xScale.invert(mouse(elem.node())[0]),
                isCompareVisible ? compareXScale.invert(mouse(elem.node())[0]) : null
            );
        }));
};

module.exports = {getNearestTime, createTooltip, createTooltipText};