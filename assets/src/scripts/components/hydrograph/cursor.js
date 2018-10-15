import { bisector } from 'd3-array';
import memoize from 'fast-memoize';
import { createSelector } from 'reselect';
import { currentVariablePointsByTsIdSelector } from './drawingData';
import { layoutSelector } from './layout';
import { xScaleSelector } from './scales';
import { isVisibleSelector } from './timeSeries';
import { Actions } from '../../store';
import { dispatch, link } from '../../lib/redux';

const SLIDER_STEPS = 1000;

// This is a bit of a hack to deal with the radius on the slider circle, so
// the slider is aligned with the graph.
const SLIDER_OFFSET_PX = 10;


export const cursorOffsetSelector = createSelector(
    xScaleSelector('current'),
    state => state.timeSeriesState.cursorOffset,
    (xScale, cursorOffset) => {
        // If cursorOffset is false, don't show it
        if (cursorOffset === false) {
            return null;
        // If cursorOffset is otherwise unset, default to the last offset
        } else if (!cursorOffset) {
            const domain = xScale.domain();
            return domain[1] - domain[0];
        } else {
            return cursorOffset;
        }
    }
);

/**
 * Returns a selector that, for a given tsKey:
 * Returns the time corresponding to the current cursor offset.
 * @param  {String} tsKey
 * @return {Date}
 */
export const cursorTimeSelector = memoize(tsKey => createSelector(
    cursorOffsetSelector,
    xScaleSelector(tsKey),
    (cursorOffset, xScale) => {
        return cursorOffset ? new Date(xScale.domain()[0] + cursorOffset) : null;
    }
));

/*
 * Return the data point nearest to time and its index.
 * @param {Array} data - array of Object where one of the keys is time.
 * @param {Date} time
 * @return {Object} - datum and index
 */
export const getNearestTime = function(data, time) {
    // Function that returns the left bounding point for a given chart point.
    if (data.length === 0) {
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
 * Returns a function that the time series data point nearest the tooltip focus time for the given time series
 * @param {Object} state - Redux store
 * @param String} tsKey - Time series key
 * @return {Object}
 */
export const tsCursorPointsSelector = memoize(tsKey => createSelector(
    currentVariablePointsByTsIdSelector(tsKey),
    cursorTimeSelector(tsKey),
    isVisibleSelector(tsKey),
    (timeSeries, cursorTime, isVisible) => {
        if (!cursorTime || !isVisible) {
            return {};
        }
        return Object.keys(timeSeries).reduce((data, tsId) => {
            const datum = getNearestTime(timeSeries[tsId], cursorTime).datum;
            data[tsId] = {
                ...datum,
                tsKey: tsKey
            };
            return data;
        }, {});
    })
);

export const cursorSlider = function (elem) {
    elem.append('div')
        .attr('class', 'slider-wrapper')
        .call(wrap => {
            wrap.append('input')
                .attr('type', 'range')
                .attr('id', 'cursor-slider')
                .attr('aria-label', 'Hydrograph cursor slider')
                .on('input', dispatch(function () {
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
                    const timeScale = domain[1] - domain[0];
                    input.attr('min', 0)
                        .attr('max', timeScale)
                        .attr('step', timeScale / SLIDER_STEPS);
                }, xScaleSelector('current')))
                .call(link((input, cursorOffset) => {
                    input.property('value', cursorOffset || input.attr('max'))
                        .classed('active', cursorOffset !== null);
                }, cursorOffsetSelector))
                .call(link((input, layout) => {
                    input.style('left', layout.margin.left - SLIDER_OFFSET_PX + 'px');
                    input.style('width', layout.width - (layout.margin.left + layout.margin.right) + SLIDER_OFFSET_PX * 2 + 'px');
                }, layoutSelector));
        });
};
