import memoize from 'fast-memoize';
import {createSelector} from 'reselect';

/*
 * Return a selector function which will return true if the specific timeSeries is in the state
 * @param {String} timeSeriesId
 * @return selector function which returns Boolean
 */
export const hasObservationsTimeSeries = memoize((timeSeriesId) => (state) => {
    return state.observationsData.timeSeries &&
        state.observationsData.timeSeries[timeSeriesId] &&
        state.observationsData.timeSeries[timeSeriesId] != {} ? true : false;
});

/*
 * Return a selector function which returns the specific timeSeries or an empty object if not in the state
 * @param {String} timeSeriesId
 * @return {Function} - selector function returns an Object
 */
export const getTimeSeries = memoize((timeSeriesId) => createSelector(
    (state) => state.observationsData,
    (observationsData) => {
        return observationsData.timeSeries? observationsData.timeSeries[timeSeriesId] || {} : {};
    }
));

