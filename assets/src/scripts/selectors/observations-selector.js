import {extent} from 'd3-array';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

/*
 * Return a selector function which returns the current time series id or null if none define
 * @return {Function} - selector function which returns {String}
 */
export const getCurrentObservationsTimeSeriesId =
    (state) => state.observationsState.currentTimeSeriesId ? state.observationsState.currentTimeSeriesId : null;

/*
 * Return a select function which returns all time series or null if none are defined
 * @return {Function} - selector function which returns {Object}
 */
export const getAllObservationsTimeSeries = (state) => state.observationsData.timeSeries ? state.observationsData.timeSeries : null;

/*
 * Return a selector function which will return true if the current timeSeries is in the state
 * @return selector function which returns Boolean
 */
export const hasCurrentObservationsTimeSeries = createSelector(
    getCurrentObservationsTimeSeriesId,
    getAllObservationsTimeSeries,
    (timeSeriesId, allTimeSeries) => {
        return timeSeriesId && allTimeSeries && allTimeSeries[timeSeriesId] ? true : false;
    }
);

/*
 * Return a selector function which returns the specific timeSeries or null if not in the state
 * @param {String} timeSeriesId
 * @return {Function} - selector function returns an Object
 */
export const getCurrentObservationsTimeSeries = createSelector(
    getCurrentObservationsTimeSeriesId,
    getAllObservationsTimeSeries,
    (timeSeriesId, allTimeSeries) => {
        return timeSeriesId && allTimeSeries && allTimeSeries[timeSeriesId] ? allTimeSeries[timeSeriesId] : null;
    }
);



/*
 * Return a selector function which returns the timeRange for the timeSeries or null if
 * the time series is not defined
 * @return {Function} - selector function returns an Object with startTime and endTime properties
 */
export const getCurrentObservationsTimeSeriesTimeRange = createSelector(
    getCurrentObservationsTimeSeries,
    (currentTimeSeries) => {
        let timeRange = null;
        if (currentTimeSeries) {
            timeRange = {
                startTime: new DateTime.fromISO(currentTimeSeries.properties.phenomenonTimeStart).toMillis(),
                endTime: new DateTime.fromISO(currentTimeSeries.properties.phenomenonTimeEnd).toMillis()
            };
        }
        return timeRange;
    }
);

/*
 * Return a selector function which returns the value range for the timeSeries or null if
 * the time series is not defined
 * @return {Function} - selector function returns an Object with min and max Number properties
 */
export const getCurrentObservationsTimeSeriesValueRange = createSelector(
   getCurrentObservationsTimeSeries,
    (currentTimeSeries) => {
        let valueRange = null;
        if (currentTimeSeries && currentTimeSeries.properties.result && currentTimeSeries.properties.result.length) {
            const rangeExtent = extent(currentTimeSeries.properties.result.map((value) => parseFloat(value)));
            valueRange = {
                min: rangeExtent[0],
                max: rangeExtent[1]
            };
        }
        return valueRange;
    }
);