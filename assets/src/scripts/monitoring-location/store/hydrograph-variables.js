
import config from 'ui/config';
import {fetchGroundwaterLevels} from 'ui/web-services/groundwater-levels';
import {fetchIVTimeSeries} from 'ui/web-services/instantaneous-values';
/*
 * Asynchronous Redux action - fetches the latest value for all parameter codes and
 * updates the store hydrograph variables.
 */

export const retrieveVariables = function(siteno) {
    return function(dispatch, getState) {
        const fetchIVVariables = fetchIVTimeSeries({sites: [siteno]}).then(series => {
            return series.value.timeSeries.reduce((varsByPCode, ts) => {
               varsByPCode[ts.variable.variableCode.value] = {
                   name: ts.variable.variableName,
                   description: ts.variable.variableDescription,
                   unit: ts.variable.unit.unitCode,
                   hasIVData: true,
                   ivMethods: ts.values.map(value => {
                       return {
                           description: value.method.methodDescription,
                           methodID: value.method.methodID
                       };
                   })
               };
            }, {});
        });
        const fetchGWLevelVariables = fetchGroundwaterLevels({site: siteno}).then(series => {
            return series.value.timeSeries.reduce((varsByPCode, ts) => {
                varsByPCode[ts.variable.variableCode.value] = {
                    name: ts.variable.variableName,
                    description: ts.variable.variableDescription,
                    unit: ts.variable.unit.unitCode,
                    hasGWLevelsData: true
                };
            }, {});
        });
        return Promise.all([fetchIVVariables, fetchGWLevelVariables]).then((ivVars, gwVars) => {
        });
    };

};