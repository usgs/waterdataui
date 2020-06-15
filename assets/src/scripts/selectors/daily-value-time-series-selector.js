import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

const getEpochMilliseconds = function(dateStr) {
   return new DateTime.fromISO(dateStr, {zone: 'UTC'}).toMillis();
};

/*
 * Selectors to return dailyValueTimeSeries state information or null if missing
 */
export const getCurrentDVParameterCode =
    (state) => state.dailyValueTimeSeriesState.currentDVParameterCode ?
        state.dailyValueTimeSeriesState.currentDVParameterCode : null;

export const getCurrentDVTimeSeriesIds =
    (state) => state.dailyValueTimeSeriesState.currentDVTimeSeriesId ?
        state.dailyValueTimeSeriesState.currentDVTimeSeriesId : null;

export const getDVGraphCursorOffset = (state) => state.dailyValueTimeSeriesState.dvGraphCursorOffset || null;
export const getDVGraphBrushOffset = (state) => state.dailyValueTimeSeriesState.dvGraphBrushOffset || null;

/*
 * Selectors to return dailyValueTimeSeries data or null if mssing
 */
export const getAvailableDVTimeSeries =
    (state) => state.dailyValueTimeSeriesData.availableDVTimeSeries ? state.dailyValueTimeSeriesData.availableDVTimeSeries : null;
export const getAllDVTimeSeries =
    (state) => state.dailyValueTimeSeriesData.dvTimeSeries ? state.dailyValueTimeSeriesData.dvTimeSeries : null;

/*
 * Return a selector function which returns an Object containing current DV timeSeries for min, median, and max. If none are available
 * null will be returned. A particular time series for a statistic can be null
 * @param {String} timeSeriesId
 * @return {Function} - selector function returns an Object with min, median, and max properties or null.
 */
export const getCurrentDVTimeSeries = createSelector(
    getCurrentDVTimeSeriesIds,
    getAllDVTimeSeries,
    (timeSeriesIds, allTimeSeries) => {
        let result = null;
        if (timeSeriesIds && allTimeSeries) {
            result = {
                min: timeSeriesIds.min && allTimeSeries[timeSeriesIds.min]? allTimeSeries[timeSeriesIds.min] : null,
                median: timeSeriesIds.median && allTimeSeries[timeSeriesIds.median] ? allTimeSeries[timeSeriesIds.median] : null,
                max: timeSeriesIds.max && allTimeSeries[timeSeriesIds.max]? allTimeSeries[timeSeriesIds.max] : null
            };
        }
        return result;
    }
);

/*
 * Return a selector function which returns a String representing the unit of measure for the current dailyValueTimeSeries time series.
 * Note that the first none null time series id will be used to fetch the unitOfMeasuresName.
 * @return {Function} - selector function returns a String. String will be empty if no current time series available.
 */
export const getCurrentDVTimeSeriesUnitOfMeasure = createSelector(
    getCurrentDVTimeSeries,
    (currentTimeSeries) => {
        let result = '';
        if (currentTimeSeries) {
            let ts = currentTimeSeries.min || currentTimeSeries.median || currentTimeSeries.max;
            result = ts.properties.unitOfMeasureName ? ts.properties.unitOfMeasureName : '';
        }
        return result;
    }
);


/*
 * Return a selector function which returns the timeRange for the current timeSeries or null if
 * the time series is not defined.
 * @return {Function} - selector function returns an Object with startTime and endTime properties which are Epoch milliseconds
 */
export const getCurrentDVTimeSeriesTimeRange = createSelector(
    getCurrentDVTimeSeries,
    (currentTimeSeries) => {
        let timeRange = null;
        if (currentTimeSeries) {
            timeRange = {
                startTime: null,
                endTime: null
            };
            Object.values(currentTimeSeries).forEach((timeSeries) => {
                if (timeSeries && timeSeries.properties) {
                    const currentTimeRange = {
                        startTime: getEpochMilliseconds(timeSeries.properties.phenomenonTimeStart),
                        endTime: getEpochMilliseconds(timeSeries.properties.phenomenonTimeEnd)
                    };
                    if (!timeRange.startTime || currentTimeRange.startTime < timeRange.startTime) {
                        timeRange.startTime = currentTimeRange.startTime;
                    }
                    if (!timeRange.endTime || currentTimeRange.endTime > timeRange.endTime) {
                        timeRange.endTime = currentTimeRange.endTime;
                    }
                }
            });
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
        if (currentTimeSeries) {
            valueRange = {
                min: null,
                max: null
            };
            Object.values(currentTimeSeries).forEach((timeSeries) => {
                if (timeSeries) {
                    const numValues = timeSeries.properties.result.map((value) => parseFloat(value));
                    const currentValueRange = {
                        min: Math.min(...numValues),
                        max: Math.max(...numValues)
                    };
                    if (!valueRange.min || currentValueRange.min < valueRange.min) {
                        valueRange.min = currentValueRange.min;
                    }
                    if (!valueRange.max || currentValueRange.max > valueRange.max) {
                        valueRange.max = currentValueRange.max;
                    }
                }
            });
        }
        return valueRange;
    }
);