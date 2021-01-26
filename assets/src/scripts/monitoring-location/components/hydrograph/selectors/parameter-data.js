import {createSelector} from 'reselect';

import config from 'ui/config';
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
    (allVariables, timeSeries, currentVariableID) => {
        if (!allVariables) {
            return [];
        }
        const seriesList = Object.values(timeSeries);

        return sortedParameters(allVariables)
            .map((variable) => {
                const parameterCode = variable.variableCode.value;
                const measuredParameterCode = parameterCode.replace(config.CALCULATED_TEMPERATURE_VARIABLE_CODE, '');

                const uvPeriodOfRecord = config.uvPeriodOfRecord && measuredParameterCode in config.uvPeriodOfRecord ?
                    config.uvPeriodOfRecord[measuredParameterCode] : null;
                const gwPeriodOfRecord = config.gwPeriodOfRecord && measuredParameterCode in config.gwPeriodOfRecord ?
                    config.gwPeriodOfRecord[measuredParameterCode] : null;
                let periodOfRecord;
                if (!uvPeriodOfRecord) {
                    periodOfRecord = gwPeriodOfRecord;
                } else if (!gwPeriodOfRecord) {
                    periodOfRecord = uvPeriodOfRecord;
                } else {
                    periodOfRecord = {
                        begin_date: uvPeriodOfRecord.begin_date < gwPeriodOfRecord.begin_date ?
                            uvPeriodOfRecord.begin_date : gwPeriodOfRecord.begin_date,
                        end_date: uvPeriodOfRecord.end_date > gwPeriodOfRecord.end_date ?
                            uvPeriodOfRecord.end_date : gwPeriodOfRecord.end_date
                    };
                }

                const hasWaterAlert = config.WATER_ALERT_PARAMETER_CODES.includes(measuredParameterCode);
                let waterAlertDisplayText;
                if (hasWaterAlert) {
                    if (measuredParameterCode === parameterCode) {
                        waterAlertDisplayText = 'Subscribe';
                    } else {
                        waterAlertDisplayText = 'Alerts in C';
                    }
                } else {
                    waterAlertDisplayText = 'N/A';
                }

                return {
                    variableID: variable.oid,
                    parameterCode: parameterCode,
                    description: variable.variableDescription,
                    selected: currentVariableID === variable.oid,
                    timeSeriesCount: seriesList.filter(ts => {
                        return ts.tsKey === 'current:P7D' && ts.variable === variable.oid;
                    }).length,
                    periodOfRecord: periodOfRecord,
                    waterAlert: {
                        hasWaterAlert,
                        subscriptionParameterCode: hasWaterAlert ? measuredParameterCode : '',
                        displayText: waterAlertDisplayText,
                        tooltipText: hasWaterAlert ? 'Subscribe to text or email alerts based on thresholds that you set' :
                            `Sorry, there are no WaterAlerts for this parameter (${parameterCode})`
                    }

                };
            });
    }
);
