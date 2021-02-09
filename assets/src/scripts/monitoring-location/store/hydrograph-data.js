
import {DateTime, Duration} from 'luxon';

import config from 'ui/config';
import {convertCelsiusToFahrenheit} from 'ui/utils';

import {fetchGroundwaterLevels} from 'ui/web-services/groundwater-levels';
import {fetchTimeSeries} from 'ui/web-services/instantaneous-values';
import {fetchSiteStatistics} from 'ui/web-services/statistics-data';

import {isCalculatedTemperature, getConvertedTemperatureParameter} from 'ml/iv-data-utils';

const getParameterToFetch = function(parameterCode) {
    return isCalculatedTemperature(parameterCode) ? parameterCode.slice(0, -1) : parameterCode;
};

export const setHydrographTimeRange = function(timeRange, timeRangeKind) {
    return {
        type: 'SET_HYDROGRAPH_TIME_RANGE',
        timeRange,
        timeRangeKind
    };
};

export const clearHydrographData = function() {
    return {
        type: 'CLEAR_HYDROGRAPH_DATA'
    };
};

export const addIVHydrographData = function(dataKind, ivData) {
    return {
        type: 'ADD_IV_HYDROGRAPH_DATA',
        dataKind,
        ivData
    };
};

export const addMedianStatisticsData = function(statsData) {
    return {
        type: 'ADD_MEDIAN_STATISTICS_DATA',
        statsData
    };
};

export const addGroundwaterLevels = function(gwLevels) {
    return {
        type: 'ADD_GROUNDWATER_LEVELS',
        gwLevels
    };
};

/*
 * startTime and endTime should be ISO 8601 time strings for all of these retrieve functions
 */
export const retrieveIVData = function(siteno, dataKind, {parameterCode, period, startTime, endTime}) {
    return function(dispatch) {
        const isCalculatedTemperatureCode = isCalculatedTemperature(parameterCode);

        return fetchTimeSeries({
            sites: [siteno],
            parameterCode: getParameterToFetch(parameterCode),
            period: period,
            startTime: startTime,
            endTime: endTime
        }).then(data => {
            const tsData = data.value.timeSeries[0];
            const noDataValue = tsData.variable.noDataValue;
            let parameter = {
                parameterCode: tsData.variable.variableCode[0].value,
                name: tsData.variable.variableName,
                description: tsData.variable.variableDescription,
                unit: tsData.variable.unit.unitCode
            };
            if (isCalculatedTemperatureCode) {
                parameter = getConvertedTemperatureParameter(parameter);
            }
            const timeSeriesData = {
                parameter : parameter,
                values: tsData.values.reduce((valuesByMethodId, value) => {
                    valuesByMethodId[value.method[0].methodID] = {
                        points: value.value.map(point => {
                            let pointValue = parseFloat(point.value);
                            pointValue = pointValue === noDataValue ? null : pointValue;
                            if (pointValue && isCalculatedTemperatureCode) {
                                pointValue = parseFloat(convertCelsiusToFahrenheit(pointValue).toFixed(2));
                            }
                            return {
                                value: pointValue,
                                qualifiers: point.qualifiers,
                                dateTime: DateTime.fromISO(point.dateTime).toMillis()
                            };
                        }),
                        method: value.method[0]
                    };
                    return valuesByMethodId;
                }, {})
            };
            dispatch(addIVHydrographData(dataKind, timeSeriesData));
        });
    };
};

export const retrievePriorYearIVData = function(siteno, {parameterCode, startTime, endTime}) {
    return function(dispatch, getState) {
        const priorYearStartTime = DateTime.fromISO(startTime).minus({days: 365}).toMillis();
        const priorYearEndTime = DateTime.fromISO(endTime).minus({days: 365}).toMillis();
        const currentPriorYearTimeRange = getState().hydrographData.compareTimeRange || null;
        if (currentPriorYearTimeRange && priorYearStartTime === currentPriorYearTimeRange.start &&
            priorYearEndTime === currentPriorYearTimeRange.end) {
            return Promise.resolve();
        } else {
            dispatch(setHydrographTimeRange({start: priorYearStartTime, end: priorYearEndTime}, 'prioryear'));
            return dispatch(retrieveIVData(siteno, 'compare', {
                parameterCode: parameterCode,
                startTime: DateTime.fromMillis(priorYearStartTime).toISO(),
                endTime: DateTime.fromMillis(priorYearEndTime).toISO()
            }));
        }
    };
};

export const retrieveMedianStatistics = function(siteno, parameterCode) {
    return function(dispatch, getState) {
        if ('medianStatistics' in getState().hydrographData) {
            return Promise.resolve();
        } else {
            const isCalculatedParameterCode = isCalculatedTemperature(parameterCode);
            const parameterToFetch = getParameterToFetch(parameterCode);
            return fetchSiteStatistics({siteno: siteno, statType: 'median', params: [parameterToFetch]})
                .then(stats => {
                    let resultStats = {};
                    if (isCalculatedParameterCode) {
                        Object.keys(stats[parameterToFetch]).forEach(methodID => {
                            resultStats[methodID] = stats[parameterToFetch][methodID].map(stat => {
                                return {
                                    ...stat,
                                    parameter_cd: parameterCode,
                                    p50_va: convertCelsiusToFahrenheit(stat.p50_va)
                                };
                            });
                        });
                    } else {
                        resultStats = stats[parameterToFetch];
                    }
                    dispatch(addMedianStatisticsData(resultStats));
                });
        }
    };
};

export const retrieveGroundwaterLevels = function(site, {parameterCode, period, startTime, endTime}) {
    return function(dispatch) {
        return fetchGroundwaterLevels({site, parameterCode, period, startTime, endTime})
            .then(data => {
                if (data.value && data.value.timeSeries && data.value.timeSeries.length) {
                    let values;
                    const timeSeries = data.value.timeSeries[0];
                    if (!timeSeries.values.length || !timeSeries.values[0].value.length) {
                        values = [];
                    } else {
                        values = timeSeries.values[0].value.map((v) => {
                            const dateTime = DateTime.fromISO(v.dateTime, {zone: 'utc'}).toMillis();
                            return {
                                point: parseFloat(v.value),
                                qualifiers: v.qualifiers,
                                dateTime: dateTime
                            };

                        });
                    }
                    const parameter = {
                        parameterCode: timeSeries.variable.variableCode.value,
                        name: timeSeries.variable.variableName,
                        description: timeSeries.variable.variableDescription,
                        unit: timeSeries.variable.unit.unitCode
                    };
                    dispatch(addGroundwaterLevels({
                        parameter,
                        values
                    }));
                }
            });
    };
};

/*
 * @param {String} siteno
 * @param {String} parameterCode}
 * @param {String} period
 * @param {String} startTime - ISO 8601 time string
 * @param {String} endTime
 */
export const retrieveHydrographData = function(siteno, {parameterCode, period, startTime, endTime, loadCompare, loadMedian}) {
    return function(dispatch) {
        const parameterToFetch = getParameterToFetch(parameterCode);
        const hasIVData = config.uvPeriodOfRecord && parameterToFetch in config.uvPeriodOfRecord;
        const hasGWData = config.gwPeriodOfRecord && parameterToFetch in config.gwPeriodOfRecord;
        dispatch(clearHydrographData());

        let timeRange;
        if (period) {
            const now = DateTime.local();
            timeRange = {
                start: now.minus(Duration.fromISO(period)).toMillis(),
                end: now.toMillis()
            };
        } else {
            timeRange = {
                start: DateTime.fromISO(startTime).toMillis(),
                end: DateTime.fromISO(startTime).toMillis()
            };
        }
        dispatch(setHydrographTimeRange(timeRange, 'current'));

        let fetchPromises = [];
        if (hasIVData) {
            fetchPromises.push(dispatch(retrieveIVData(
                siteno, 'primary', {parameterCode, period, startTime, endTime})));
        }
        if (hasGWData) {
            fetchPromises.push(dispatch(
                retrieveGroundwaterLevels(siteno, {parameterCode, period, startTime, endTime})));
        }
        if (hasIVData && loadCompare) {
            fetchPromises.push(dispatch(
                retrievePriorYearIVData(siteno, {
                    parameterCode: parameterCode,
                    startTime: DateTime.fromMillis(timeRange.start).toISO(),
                    endTime: DateTime.fromMillis(timeRange.end).toISO()
                })));
        }
        if (hasIVData && loadMedian) {
            fetchPromises.push(dispatch(
                retrieveMedianStatistics(siteno, parameterCode)));
        }

        return Promise.all(fetchPromises);
    };
};

export const hydrographDataReducer = function(hydrographData = {}, action) {
    switch(action.type) {
        case 'SET_HYDROGRAPH_TIME_RANGE': {
            let newData = {};
            newData[`${action.timeRangeKind}TimeRange`] = action.timeRange;
            return Object.assign({}, hydrographData, newData);
        }
        case 'CLEAR_HYDROGRAPH_DATA': {
            return {};
        }
        case 'ADD_IV_HYDROGRAPH_DATA': {
            let newData = {};
            newData[`${action.dataKind}IVData`] = action.ivData;
            return Object.assign({}, hydrographData, newData);
        }
        case 'ADD_MEDIAN_STATISTICS_DATA': {
            return {
                ...hydrographData,
                medianStatisticsData: action.statsData
            };
        }
        case 'ADD_GROUNDWATER_LEVELS': {
            return {
                ...hydrographData,
                groundwaterLevels: action.gwLevels
            };
        }
        default:
            return hydrographData;
    }
};