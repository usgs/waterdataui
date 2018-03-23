const { bisector } = require('d3-array');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');

const { layoutSelector, MARGIN } = require('./layout');
const { xScaleSelector } = require('./scales');
const { currentVariableTimeSeriesSelector, isVisibleSelector } = require('./timeseries');

const { Actions } = require('../../store');
const { dispatch, link } = require('../../lib/redux');

const SLIDER_STEPS = 1000;

// This is a bit of a hack to deal with the radius on the slider circle, so
// the slider is aligned with the graph.
const SLIDER_OFFSET_PX = 10;


const cursorOffsetSelector = state => state.cursorOffset;

/**
 * Returns a selector that, for a given tsKey:
 * Returns the time corresponding to the current cursor offset.
 * @param  {String} tsKey
 * @return {Date}
 */
const cursorTimeSelector = memoize(tsKey => createSelector(
    cursorOffsetSelector,
    xScaleSelector(tsKey),
    (cursorOffset, xScale) => {
        return cursorOffset ? new Date(xScale.domain()[0].getTime() + cursorOffset) : null;
    }
));

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
 * Returns a function that the time series data point nearest the tooltip focus time for the given timeseries
 * @param {Object} state - Redux store
 * @param String} tsKey - Timeseries key
 * @return {Object}
 */
const tsCursorPointsSelector = memoize(tsKey => createSelector(
    currentVariableTimeSeriesSelector(tsKey),
    cursorTimeSelector(tsKey),
    isVisibleSelector(tsKey),
    (timeSeries, cursorTime, isVisible) => {
        if (!cursorTime || !isVisible) {
            return {};
        }
        return Object.keys(timeSeries).reduce((data, tsId) => {
            data[tsId] = getNearestTime(timeSeries[tsId].points, cursorTime).datum;
            return data;
        }, {});
    })
);

const cursorSlider = function (elem) {
    elem.append('div')
        .attr('class', 'slider-wrapper')
        .call(wrap => {
            wrap.append('input')
                .attr('type', 'range')
                .attr('id', 'cursor-slider')
                .style('left', MARGIN.left - SLIDER_OFFSET_PX + 'px')
                .on('input', dispatch(function () {
                    console.log('input', this.valueAsNumber);
                    return Actions.setCursorOffset(this.valueAsNumber);
                }))
                .on('focus', dispatch(function () {
                    return Actions.setCursorOffset(this.valueAsNumber);
                }))
                .on('blur', dispatch(function () {
                    return Actions.setCursorOffset(null);
                }))
                .call(link((input, xScale) => {
                    const domain = xScale.domain();
                    const timeScale = domain[1].getTime() - domain[0].getTime();
                    input.attr('min', 0)
                        .attr('max', timeScale)
                        .attr('step', timeScale / SLIDER_STEPS);
                }, xScaleSelector('current')))
                .call(link((input, cursorOffset) => {
                    input.property('value', cursorOffset || input.attr('max'))
                        .classed('active', cursorOffset !== null);
                }, cursorOffsetSelector))
                .call(link((input, layout) => {
                    input.style('width', layout.width - MARGIN.right + SLIDER_OFFSET_PX * 2 + 'px');
                }, layoutSelector));
        });
};

module.exports = {cursorOffsetSelector, cursorTimeSelector, getNearestTime, tsCursorPointsSelector, cursorSlider};
