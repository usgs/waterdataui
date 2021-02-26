
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

/*
 * Synchronous Redux action which sets the time range for the timeRangeKind
 * @param {Object} timeRange
 *      @prop {Number} start = Unix epoch in milliseconds
 *      @prop {Number} end - Unix epoch in milliseconds
 * @param {String} timeRangeKind - expected values: 'current', 'prioryear'
 * @return {Object} Redux action
 */
const setHydrographTimeRange = function(timeRange, timeRangeKind) {
    return {
        type: 'SET_HYDROGRAPH_TIME_RANGE',
        timeRange,
        timeRangeKind
    };
};

/*
 * Synchronous Redux action which clears all data
 * @return {Object} Redux action
 */
const clearHydrographData = function() {
    return {
        type: 'CLEAR_HYDROGRAPH_DATA'
    };
};

/*
 * Synchronous Redux action which sets the IV data  for the dataKind
 * @param {Object} ivData
 *      @prop {Object} parameter
 *      @prop {Object} values - Keys are the method ids.
 * @return {Object} Redux action
 */
const addIVHydrographData = function(dataKind, ivData) {
    return {
        type: 'ADD_IV_HYDROGRAPH_DATA',
        dataKind,
        ivData
    };
};

/*
 * Synchronous Redux action which sets the median data
 * @param {Object} statsData
 * @return {Object} Redux action
 */
const addMedianStatisticsData = function(statsData) {
    return {
        type: 'ADD_MEDIAN_STATISTICS_DATA',
        statsData
    };
};

/*
 * Synchronous Redux action which sets the median data
 * @param {Object} gwLevels
 *      @prop {Object} parameter
 *      @prop {Array} values
 * @return {Object} Redux action
 */
const addGroundwaterLevels = function(gwLevels) {
    return {
        type: 'ADD_GROUNDWATER_LEVELS',
        gwLevels
    };
};

/*
 * Asynchronous Redux action to fetch the IV data for siteno, parameterCode, period or startTime/endTime
 * for the dataKind
 * @param {String} siteno
 * @param {String} dataKind - expected values: 'primary', 'compare'
 * @param {String} parameterCode
 * @param {String} period - ISO 8601 duration
 * @param {String} startTime - ISO 8601 time string
 * @param {String} endTime - ISO 8601 time string
 * @return {Function} that returns a Promise
 */
const retrieveIVData = function(siteno, dataKind, {parameterCode, period, startTime, endTime}) {
    return function(dispatch) {
        const isCalculatedTemperatureCode = isCalculatedTemperature(parameterCode);

        return fetchTimeSeries({
            sites: [siteno],
            parameterCode: getParameterToFetch(parameterCode),
            period: period,
            startTime: startTime,
            endTime: endTime
        }).then(data => {
            if (data.value && data.value.timeSeries && data.value.timeSeries.length) {
                const tsData = data.value.timeSeries[0];
                // Create parameter object and adjust data if parameter code is calculated
                let parameter = {
                    parameterCode: tsData.variable.variableCode[0].value,
                    name: tsData.variable.variableName,
                    description: tsData.variable.variableDescription,
                    unit: tsData.variable.unit.unitCode
                };
                if (isCalculatedTemperatureCode) {
                    parameter = getConvertedTemperatureParameter(parameter);
                }

                // Convert values from strings to float and set to null if they have the noDataValue.
                // If calculated parameter code, update the value.
                const noDataValue = tsData.variable.noDataValue;
                const values = tsData.values.reduce((valuesByMethodId, value) => {
                    valuesByMethodId[value.method[0].methodID] = {
                        points: value.value.map(point => {
                            let pointValue = parseFloat(point.value);
                            pointValue = pointValue === noDataValue ? null : pointValue;
                            if (pointValue !== null && isCalculatedTemperatureCode) {
                                pointValue = parseFloat(convertCelsiusToFahrenheit(pointValue).toFixed(2));
                            }
                            return {
                                value: pointValue,
                                qualifiers: point.qualifiers,
                                dateTime: DateTime.fromISO(point.dateTime).toMillis()
                            };
                        }),
                        method: {
                            ...value.method[0],
                            methodID: value.method[0].methodID.toString()
                        }
                    };
                    return valuesByMethodId;
                }, {});

                dispatch(addIVHydrographData(dataKind, {
                    parameter,
                    values
                }));
            }
        });
    };
};

/*
 * Asynchronous Redux action to fetch the IV data for siteno, parameterCode and startTime/endTime
 * @param {String} siteno
 * @param {String} parameterCode
 * @param {String} startTime - Epoch time
 * @param {String} endTime - EpochTime
 * @return {Function} that returns a Promise
 */
export const retrievePriorYearIVData = function(siteno, {parameterCode, startTime, endTime}) {
    return function(dispatch, getState) {
        const priorYearStartTime = DateTime.fromMillis(startTime).minus({days: 365}).toMillis();
        const priorYearEndTime = DateTime.fromMillis(endTime).minus({days: 365}).toMillis();
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

/*
 * Asynchronous Redux action to fetch the median for siteno and parameterCode
 * @param {String} siteno
 * @param {String} parameterCode
 * @return {Function} that returns a Promise
 */
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
                    if (parameterToFetch in stats) {
                        Object.keys(stats[parameterToFetch]).forEach(methodID => {
                            resultStats[methodID] = stats[parameterToFetch][methodID].map(stat => {
                                const p50Va = isCalculatedParameterCode ? convertCelsiusToFahrenheit(stat.p50_va) : parseFloat(stat.p50_va);
                                return {
                                    ...stat,
                                    month_nu: parseInt(stat.month_nu),
                                    day_nu: parseInt(stat.day_nu),
                                    p50_va: p50Va
                                };
                            });
                        });
                    }
                    dispatch(addMedianStatisticsData(resultStats));
                });
        }
    };
};

/*
 * Asynchronous Redux action to fetch the groundwater levels data for siteno, parameterCode, period or startTime/endTime
 * for the dataKind
 * @param {String} siteno
 * @param {String} parameterCode
 * @param {String} period - ISO 8601 duration
 * @param {String} startTime - ISO 8601 time string
 * @param {String} endTie - ISO 8601 time string
 * @return {Function} that returns a Promise
 */
const retrieveGroundwaterLevels = function(site, {parameterCode, period, startTime, endTime}) {
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
                                value: parseFloat(v.value),
                                qualifiers: v.qualifiers,
                                dateTime: dateTime
                            };

                        });
                    }
                    const parameter = {
                        parameterCode: timeSeries.variable.variableCode[0].value,
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
 * Asynchronous Redux action which clears all data and then retrieves all of the data needed to display the hydrograph.
 * The IV and groundwater levels are automatically loaded if available. Compare and median data
 * are loaded if requested
 * @param {String} siteno
 * @param {String} parameterCode
 * @param {String} period - ISO 8601 duration
 * @param {String} startTime - ISO 8601 time string
 * @param {String} endTime - ISO 8601 time string
 * @param {Boolean} loadCompare
 * @param {Boolean} loadMedian
 * @return {Function} that returns a promise
 */
export const retrieveHydrographData = function(siteno, {parameterCode, period, startTime, endTime, loadCompare, loadMedian}) {
    return function(dispatch) {
        const parameterToFetch = getParameterToFetch(parameterCode);
        const hasIVData = config.ivPeriodOfRecord && parameterToFetch in config.ivPeriodOfRecord;
        const hasGWData = config.gwPeriodOfRecord && parameterToFetch in config.gwPeriodOfRecord;
        dispatch(clearHydrographData());

        let timeRange;
        if (period && period !== 'custom') {
            const now = DateTime.local();
            timeRange = {
                start: now.minus(Duration.fromISO(period)).toMillis(),
                end: now.toMillis()
            };
        } else {
            timeRange = {
                start: DateTime.fromISO(startTime).toMillis(),
                end: DateTime.fromISO(endTime).toMillis()
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
        if (hasIVData && loadCompare && config.ALLOW_COMPARE_DATA_FOR_PERIODS.includes(period)) {
            fetchPromises.push(dispatch(
                retrievePriorYearIVData(siteno, {
                    parameterCode: parameterCode,
                    startTime: timeRange.start,
                    endTime: timeRange.end
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