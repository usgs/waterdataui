import memoize from 'fast-memoize';
import {createSelector, createStructuredSelector} from 'reselect';

import config from '../../config';
import {Actions} from '../../store';
import {link} from '../../lib/d3-redux';
import {getCurrentMethodID} from '../../selectors/time-series-selector';
import {getNearestTime} from '../../utils';

import {currentVariablePointsByTsIdSelector} from './drawing-data';
import {getMainLayout} from './layout';
import {getMainXScale} from './scales';
import {isVisibleSelector} from './time-series';


const SLIDER_STEPS = 1000;

// This is a bit of a hack to deal with the radius on the slider circle, so
// the slider is aligned with the graph.
const SLIDER_OFFSET_PX = 10;


export const cursorOffsetSelector = createSelector(
    getMainXScale('current'),
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
    getMainXScale(tsKey),
    (cursorOffset, xScale) => {
        return cursorOffset ? new Date(xScale.domain()[0] + cursorOffset) : null;
    }
));

/*
 * Returns a function that the time series data point nearest the tooltip focus time for the given time series
 * with the current variable and current method
 * @param {Object} state - Redux store
 * @param String} tsKey - Time series key
 * @return {Object}
 */
export const tsCursorPointsSelector = memoize(tsKey => createSelector(
    currentVariablePointsByTsIdSelector(tsKey),
    getCurrentMethodID,
    cursorTimeSelector(tsKey),
    isVisibleSelector(tsKey),
    (timeSeries, currentMethodId, cursorTime, isVisible) => {
        if (!cursorTime || !isVisible) {
            return {};
        }
        return Object.keys(timeSeries).reduce((data, tsId) => {
            if (timeSeries[tsId].length &&
                (!config.MULTIPLE_TIME_SERIES_METADATA_SELECTOR_ENABLED || parseInt(tsId.split(':')[0]) === currentMethodId)) {
                const datum = getNearestTime(timeSeries[tsId], cursorTime);
                data[tsId] = {
                    ...datum,
                    tsKey: tsKey
                };
            }
            return data;
        }, {});
    })
);

export const cursorSlider = function (elem, store) {
    elem.append('div')
        .attr('class', 'slider-wrapper')
        .call(wrap => {
            wrap.append('input')
                .attr('type', 'range')
                .attr('id', 'cursor-slider')
                .attr('class', 'usa-range')
                .attr('aria-label', 'Hydrograph cursor slider')
                .on('input', function() {
                    store.dispatch(Actions.setCursorOffset(this.valueAsNumber));
                })
                .on('focus', function () {
                    store.dispatch(Actions.setCursorOffset(this.valueAsNumber));
                })
                .on('blur', function () {
                    store.dispatch(Actions.setCursorOffset(null));
                })
                .call(link(store,(input, xScale) => {
                    const domain = xScale.domain();
                    const timeScale = domain[1] - domain[0];
                    input.attr('min', 0)
                        .attr('max', timeScale)
                        .attr('step', timeScale / SLIDER_STEPS);
                }, getMainXScale('current')))
                .call(link(store,(input, cursorOffset) => {
                    input.property('value', cursorOffset || input.attr('max'))
                        .classed('active', cursorOffset !== null);
                }, cursorOffsetSelector))
                .call(link(store,(input, {layout, xScale}) => {
                    const maxXScaleRange = xScale.range()[1];
                    input.style('left', layout.margin.left - SLIDER_OFFSET_PX + 'px');
                    input.style('right', layout.margin.right - SLIDER_OFFSET_PX + 'px');
                    input.style('width', maxXScaleRange - (layout.margin.left + layout.margin.right) + SLIDER_OFFSET_PX * 2 + 'px');
                }, createStructuredSelector( {
                    layout: getMainLayout,
                    xScale: getMainXScale('current')
                })));
        });
};
