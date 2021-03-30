import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import config from 'ui/config';
import {sortedParameters} from 'ui/utils';

/**
 * Returns a Redux selector function which returns an sorted array of metadata
 * for each available parameter . Each object has the following properties:
 *      @prop {String} parameterCode
 *      @prop {String} description
 *      @prop {Object} periodOfRecord - with beginDate and endDate String properties
 *      @prop {Object} waterAlert - with Boolean hasWaterAlert and if true, additional String properties
 *          (subscriptionParameterCode, displayText, tooltipText)
 * Other properties from the Redux store are also included
 */
export const getAvailableParameters = createSelector(
    (state) => state.hydrographParameters,
    allParameters => {
        if (!Object.keys(allParameters).length) {
            return [];
        }

        return sortedParameters(allParameters)
            .map((parameter) => {
                const parameterCode = parameter.parameterCode;
                const measuredParameterCode = parameterCode.replace(config.CALCULATED_TEMPERATURE_VARIABLE_CODE, '');
                const ivPeriodOfRecord = parameter.hasIVData && measuredParameterCode in config.ivPeriodOfRecord ?
                    config.ivPeriodOfRecord[measuredParameterCode] : null;
                const gwPeriodOfRecord = parameter.hasGWLevelsData && measuredParameterCode in config.gwPeriodOfRecord ?
                    config.gwPeriodOfRecord[measuredParameterCode] : null ;
                let periodOfRecord;

                if (ivPeriodOfRecord && gwPeriodOfRecord) {
                    periodOfRecord = {
                        begin_date: DateTime.fromISO(ivPeriodOfRecord.begin_date) < DateTime.fromISO(gwPeriodOfRecord.begin_date) ?
                            ivPeriodOfRecord.begin_date : gwPeriodOfRecord.begin_date,
                        end_date: DateTime.fromISO(ivPeriodOfRecord.end_date) > DateTime.fromISO(gwPeriodOfRecord.end_date) ?
                            ivPeriodOfRecord.end_date : gwPeriodOfRecord.end_date
                    };
                } else if (ivPeriodOfRecord) {
                    periodOfRecord = ivPeriodOfRecord;
                } else if (gwPeriodOfRecord) {
                    periodOfRecord = gwPeriodOfRecord;
                } else {
                    periodOfRecord = {
                        begin_date: '',
                        end_date: ''
                    };
                }

                const hasWaterAlert = !!(parameter.hasIVData && config.WATER_ALERT_PARAMETER_CODES.includes(measuredParameterCode));
                let waterAlertDisplayText;
                let waterAlertTooltipText;

                waterAlertTooltipText = 'Subscribe to text or email alerts based on thresholds that you set';
                if (measuredParameterCode === parameterCode) {
                    waterAlertDisplayText = 'Subscribe to Alerts';
                } else {
                    waterAlertDisplayText = 'Subscribe to Alerts in Celsius';
                }

                return {
                    ...parameter,
                    periodOfRecord,
                    waterAlert: {
                        hasWaterAlert,
                        subscriptionParameterCode: hasWaterAlert ? measuredParameterCode : '',
                        displayText: waterAlertDisplayText,
                        tooltipText: waterAlertTooltipText
                    }
                };
            });
    }
);
