import {createSelector} from 'reselect';

import {
    getCurrentDVTimeSeries,
    getCurrentDVTimeSeriesUnitOfMeasure
} from 'ml/selectors/daily-value-time-series-selector';

/*
 * Returns a selector function that returns a string that can be used as the title of the graph
 */
export const getCurrentTimeSeriesTitle = createSelector(
    getCurrentDVTimeSeries,
    (timeSeries) => {
        // We will take the first available time series observedPropertyName
        let result = '';
        if (timeSeries) {
            const propertyNames =
                Object.values(timeSeries)
                    .filter(ts => ts ? true : false)
                    .map(ts => ts.properties.observedPropertyName);
            if (propertyNames.length) {
                result = propertyNames[0];
            }
        }
        return result;
    }
);

/*
 * Returns a selector function that returns a string that can be used as the description of the graph
 */
export const getCurrentTimeSeriesDescription = createSelector(
    getCurrentDVTimeSeries,
    (timeSeries) => {
        // We will take the first available time series
        let result = '';
        if (timeSeries) {
            const descriptions =
                Object.values(timeSeries)
                    .filter(ts => ts ? true : false)
                    .map((ts) => {
                        return {
                            propertyName: ts.properties.observedPropertyName,
                            featureName: ts.properties.samplingFeatureName
                        };
                    });
            if (descriptions.length) {
                result = `${descriptions[0].propertyName} for ${descriptions[0].featureName}`;
            }
        }
        return result;
    }
);

/*
 * Returns a selector function that returns a string that can be used as the label of the y axis graph
 */
export const getCurrentTimeSeriesYTitle = createSelector(
    getCurrentTimeSeriesTitle,
    getCurrentDVTimeSeriesUnitOfMeasure,
    (title, units) => {
        return title && units ? `${title}, ${units}` : '';

    }
);
