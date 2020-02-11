import {createSelector} from 'reselect';

import {getCurrentObservationsTimeSeries} from '../../../selectors/observations-selector';

/*
 * Returns a selector function that returns a string that can be used as the title of the graph
 */
export const getCurrentTimeSeriesTitle = createSelector(
    getCurrentObservationsTimeSeries,
    (timeSeries) => {
        return timeSeries && timeSeries.properties ?
            timeSeries.properties.observedPropertyName : '';
    }
);

/*
 * Returns a selector function that returns a string that can be used as the description of the graph
 */
export const getCurrentTimeSeriesDescription = createSelector(
    getCurrentObservationsTimeSeries,
    (timeSeries) => {
        return timeSeries && timeSeries.properties ?
            `${timeSeries.properties.observedPropertyName} for ${timeSeries.properties.samplingFeatureName}` : '';
    }
);

/*
 * Returns a selector function that returns a string that can be used as the label of the y axis graph
 */
export const getCurrentTimeSeriesYTitle = createSelector(
    getCurrentObservationsTimeSeries,
    (timeSeries) => {
        return timeSeries && timeSeries.properties ?
            `${timeSeries.properties.observedPropertyName}, ${timeSeries.properties.unitOfMeasureName}` : '';
    }
);
