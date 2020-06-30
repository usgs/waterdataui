/*
 * Note the audible interface is not currently enabled and will likely need a major implementation
 * The current patterns of putting the selectors in a separate module from rendering code and
 * updating the selectors to use is* or get* pattern.
 */
import {scaleLinear} from 'd3-scale';
import {createSelector} from 'reselect';

import {getTimeSeries} from '../../../selectors/time-series-selector';

import {tsCursorPointsSelector} from './cursor';
import {getMainYScale} from './scales';

/*
 * Returns a Redux selector function that returns true if the audible interface is playing.
 */
export const isAudiblePlaying = state => state.ivTimeSeriesStat.audiblePlayId !== null;

const getAudibleYScale = createSelector(
    getMainYScale,
    (yScale) => {
        return scaleLinear()
            .domain(yScale.domain())
            .range([80, 1500]);
    }
);

/*
 * Returns a Redux selector function which retrieves an array of time series points where the
 * value can be used for pitches.
 */
export const getAudiblePoints = createSelector(
    getTimeSeries,
    tsCursorPointsSelector('current'),
    tsCursorPointsSelector('compare'),
    getAudibleYScale,
    (allTimeSeries, currentPoints, comparePoints, yScale) => {
        // Set null points for all time series, so we can turn audio for those
        // points off when toggling to other time series.
        let points = Object.keys(allTimeSeries).reduce((points, tsID) => {
            points[tsID] = null;
            return points;
        }, {});

        // Get the pitches for the current-year points
        points = Object.keys(currentPoints).reduce((points, tsID) => {
            const pt = currentPoints[tsID];
            points[tsID] = yScale(pt.value);
            return points;
        }, points);

        // Get the pitches for the compare-year points
        return Object.keys(comparePoints).reduce((points, tsID) => {
            const pt = comparePoints[tsID];
            points[tsID] = yScale(pt.value);
            return points;
        }, points);
    }
);