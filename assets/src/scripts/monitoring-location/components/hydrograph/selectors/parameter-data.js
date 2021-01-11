import {createSelector} from 'reselect';

import {sortedParameters} from 'ui/utils';
import {getCurrentVariableID, getTimeSeries, getVariables} from 'ml/selectors/time-series-selector';

/**
 * Returns a Redux selector function which returns an sorted array of metadata
 * for each available parameter code. Each object has the following properties:
 *      @prop {String} variableID
 *      @prop {String} parameterCode
 *      @prop {String} description
 *      @prop {Boolean} selected - True if this is the currently selected parameter
 *      @prop {Number} timeSeriesCount - count of unique time series for this parameter
 */
export const getAvailableParameterCodes = createSelector(
    getVariables,
    getTimeSeries,
    getCurrentVariableID,
    (variables, timeSeries, currentVariableID) => {
        if (!variables) {
            return [];
        }

        const seriesList = Object.values(timeSeries);
        const availableVariableIds = seriesList.map(x => x.variable);
        return sortedParameters(variables)
            .filter(variable => availableVariableIds.includes(variable.oid))
            .map((variable) => {
                return {
                    variableID: variable.oid,
                    parameterCode: variable.variableCode.value,
                    description: variable.variableDescription,
                    selected: currentVariableID === variable.oid,
                    timeSeriesCount: seriesList.filter(ts => {
                        return ts.tsKey === 'current:P7D' && ts.variable === variable.oid;
                    }).length
                };
            });
    }
);
