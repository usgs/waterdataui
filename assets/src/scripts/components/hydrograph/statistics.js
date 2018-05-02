const { range } = require('lodash');
const { isLeapYear } = require('../../models');
const { calcStartTime } = require('../../utils');

/**
 * Make statisical data look like a timeseries for plotting purposes
 *
 * @param series -- an object with the following keys: points, startTime, and endTime at a minimum. Each point should have a javascript month and day
 * @param period -- NWIS time period string (e.g. 'P7D') denoted the period of time to display
 * @returns {*[]}
 */
export const coerceStatisticalSeries = function (series, period) {
    const startTime = calcStartTime(period, series.endTime);
    const startYear = startTime.getFullYear();
    const endYear = series.endTime.getFullYear();
    const yearRange = range(startYear, endYear + 1);
    let points = series.points;
    let plotablePoints = [];
    yearRange.forEach(year => {
        points.forEach(point => {
            let month = point.month;
            let day = point.day;
            let dataPoint = Object.assign({}, point);
            dataPoint.dateTime = dataPoint.dateTime ? dataPoint.dateTime : new Date(year, month, day);
            if (!isLeapYear(year)) {
                if(!(month === 1 && day === 29)) {
                    plotablePoints.push(dataPoint);
                }
            } else {
                plotablePoints.push(dataPoint);
            }
        });
    });
    let sortedPoints = plotablePoints.sort(function(a, b) {
        return a.dateTime - b.dateTime;
    });
    let filtered = sortedPoints.filter(x => startTime <= x.dateTime && x.dateTime <= series.endTime);
    let first = filtered[0];
    if (first.dateTime > startTime) {
        let previousIndex;
        if (sortedPoints.indexOf(first) === 0) {
            previousIndex = sortedPoints.length - 1;
        } else {
            previousIndex = sortedPoints.indexOf(first) - 1;
        }
        const previousVal = sortedPoints[previousIndex];
        let leftVal = Object.assign({}, previousVal);
        leftVal.dateTime = startTime;
        filtered.unshift(leftVal);
    }
    let last = filtered[filtered.length - 1];
    if (last.dateTime < series.endTime) {
        let rightVal = Object.assign({}, last);
        rightVal.dateTime = series.endTime;
        filtered.push(rightVal);
    }
    return filtered;
};
