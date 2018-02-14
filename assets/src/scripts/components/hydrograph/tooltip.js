
const { max, bisector } = require('d3-array');
const { mouse } = require('d3-selection');

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

const createTooltipText = function(elem, tskeys) {
    let tooltipTextGroup = elem.append('g')
        .attr('class', 'tooltip-text-group')
        .style('display', 'none');
    let y = 0;
    for (let tskey of tskeys) {
        tooltipTextGroup.append('text')
            .attr('class', `${tskey}-tooltip-text`)
            .attr('x', 15)
            .attr('y', `${y}em`);
        y += 1;
    }
    return tooltipTextGroup;
};

const updateCircleFocus = function(circleFocus, {xScale, yScale, tsDatum}) {
    if (tsDatum.value) {
        circleFocus.style('display', null)
            .attr('transform',
                `translate(${xScale(tsDatum.time)}, ${yScale(tsDatum.value)})`);
    } else {
        circleFocus.style('display', 'none');
    }
};

const updateTooltipText = function(text, tsDatum) {
    text.classed('approved', tsDatum.approved)
        .classed('estimated', tsDatum.estimated)
        .text(() => tsDatum.label);
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
    let tooltipText = createTooltipText(elem, ['current', 'compare']);

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
            tooltipText.style('display', null);
        })
        .on('mouseout', () => {
            focusLine.style('display', 'none');
            focusCurrentCircle.style('display', 'none');
            focusCompareCircle.style('display', 'none');
            tooltipText.style('display', 'none');
        })
        .on('mousemove', function() {
            const currentTime = xScale.invert(mouse(this)[0]);
            const currentData = getNearestTime(currentTsData, currentTime);

            if (!currentData) {
                return;
            }

            // Update the focus line
            const currentTimeRange = xScale(currentData.datum.time);
            focusLine.select('.focus-line')
                .attr('x1', currentTimeRange)
                .attr('x2', currentTimeRange);

            // Update the current TS focus circle and tooltip text
            updateCircleFocus(focusCurrentCircle, {
                xScale: xScale,
                yScale: yScale,
                tsDatum: currentData.datum
            });
            updateTooltipText(tooltipText.select('.current-tooltip-text'), currentData.datum);

            //Update the compare TS focus circle and tooltip text if we are showing it.
            if (isCompareVisible) {
                const compareTime = compareXScale.invert(mouse(this)[0]);
                const compareData = getNearestTime(compareTsData, compareTime);
                if(!compareData) {
                    return;
                }
                updateTooltipText(tooltipText.select('.compare-tooltip-text'), compareData.datum);
                updateCircleFocus(focusCompareCircle, {
                    xScale: compareXScale,
                    yScale: yScale,
                    tsDatum: compareData.datum
                });
            }
        });
};

module.exports = {getNearestTime, createTooltip};