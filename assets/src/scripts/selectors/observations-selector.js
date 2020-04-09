import {extent} from 'd3-array';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';
/*
 * Selectors to return observations state information or null if missing
 */
export const getCurrentDVTimeSeriesId =
    (state) => state.observationsState.currentDVTimeSeriesId ? state.observationsState.currentDVTimeSeriesId : null;

export const getDVGraphCursorOffset = (state) => state.observationsState.dvGraphCursorOffset || null;
export const getDVGraphBrushOffset = (state) => state.observationsState.dvGraphBrushOffset || null;

/*
 * Selectors to return observations data or null if mssing
 */
export const getAvailableDVTimeSeries =
    (state) => state.observationsData.availableDVTimeSeries ? state.observationsData.availableDVTimeSeries : null;
export const getAllDVTimeSeries =
    (state) => state.observationsData.dvTimeSeries ? state.observationsData.dvTimeSeries : null;

/*
 * Return a selector function which will return true if the current DV timeSeries is in the state
 * @return selector function which returns Boolean
 */
export const hasCurrentDVTimeSeries = createSelector(
    getCurrentDVTimeSeriesId,
    getAllDVTimeSeries,
    (timeSeriesId, allTimeSeries) => {
        return timeSeriesId && allTimeSeries && allTimeSeries[timeSeriesId] ? true : false;
    }
);

/*
 * Return a selector function which returns the current DV timeSeries or null if not in the state
 * @param {String} timeSeriesId
 * @return {Function} - selector function returns an Object
 */
export const getCurrentDVTimeSeries = createSelector(
    getCurrentDVTimeSeriesId,
    getAllDVTimeSeries,
    (timeSeriesId, allTimeSeries) => {
        return timeSeriesId && allTimeSeries && allTimeSeries[timeSeriesId] ? allTimeSeries[timeSeriesId] : null;
    }
);

/*
 * Return a selector function which returns a String representing the unit of measure for the current observations time series
 * @return {Function} - selector function returns a String. String will be empty if no current time series available.
 */
export const getCurrentDVTimeSeriesUnitOfMeasure = createSelector(
    getCurrentDVTimeSeries,
    (currentTimeSeries) => {
        return currentTimeSeries ? currentTimeSeries.properties.unitOfMeasureName : '';
    }
);



/*
 * Return a selector function which returns the timeRange for the timeSeries or null if
 * the time series is not defined
 * @return {Function} - selector function returns an Object with startTime and endTime properties
 */
export const getCurrentDVTimeSeriesTimeRange = createSelector(
    getCurrentDVTimeSeries,
    (currentTimeSeries) => {
        let timeRange = null;
        if (currentTimeSeries) {
            timeRange = {
                startTime: new DateTime.fromISO(currentTimeSeries.properties.phenomenonTimeStart, {zone: 'UTC'}).toMillis(),
                endTime: new DateTime.fromISO(currentTimeSeries.properties.phenomenonTimeEnd, {zone: 'UTC'}).toMillis()
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
export const getCurrentDVTimeSeriesValueRange = createSelector(
   getCurrentDVTimeSeries,
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