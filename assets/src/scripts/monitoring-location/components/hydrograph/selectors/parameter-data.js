import {createSelector} from 'reselect';

import config from 'ui/config';
import {sortedParameters} from 'ui/utils';
import {getCurrentVariableID, getTimeSeries, getVariables, getVariablesCalculated} from 'ml/selectors/time-series-selector';

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
    getVariablesCalculated,
    getTimeSeries,
    getCurrentVariableID,
    (variables, variablesCalculated, timeSeries, currentVariableID) => {
        if (!variables) {
            return [];
        }

        const seriesList = Object.values(timeSeries);
        const availableVariableIds = seriesList.map(x => x.variable);
        console.log('variables ', variables)
        console.log('getVariablesCalculated ', variablesCalculated)
        variables = {
            ...variables,
            ...variablesCalculated
        };
        console.log('variables after combine ', variables)

        const test = sortedParameters(variables)
            .filter(variable => availableVariableIds.includes(variable.oid))
            .map((variable) => {
                return {
                    variableID: variable.variableCode.value.includes(config.CALCULATED_TEMPERATURE_VARIABLE_CODE) ? `${variable.oid}${config.CALCULATED_TEMPERATURE_VARIABLE_CODE}`: variable.oid,
                    parameterCode: variable.variableCode.value,
                    description: variable.variableDescription,
                    selected: currentVariableID === variable.oid,
                    timeSeriesCount: seriesList.filter(ts => {
                        return ts.tsKey === 'current:P7D' && ts.variable === variable.oid;
                    }).length
                };
            });
        // console.log('test ', test)
        return test;
    }
);
