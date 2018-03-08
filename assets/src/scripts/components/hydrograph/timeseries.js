const { timeFormat } = require('d3-time-format');
const memoize = require('fast-memoize');
const { createSelector } = require('reselect');


// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');

export const MASK_DESC = {
    ice: 'Ice Affected',
    fld: 'Flood',
    bkw: 'Backwater',
    zfl: 'Zeroflow',
    dry: 'Dry',
    ssn: 'Seasonal',
    pr: 'Partial Record',
    rat: 'Rating Development',
    eqp: 'Equipment Malfunction',
    mnt: 'Maintenance',
    dis: 'Discontinued',
    tst: 'Test',
    pmp: 'Pump',
    '***': 'Unavailable'
};


/**
 * For a given tsKey, returns a selector that:
 * Returns the top-level IV service request object.
 * @return {Object}     Top-level IV request data
 */
export const requestSelector = memoize(tsKey => state => {
    return state.series.requests && state.series.requests[tsKey] ? state.series.requests[tsKey] : null;
});


/**
 * For a given tsKey, returns a selector that:
 * Returns all sets of time series returned by the IV service.
 * @return {Array}     List of "collections" (collection: list of time series for a given site/parameter combination)
 */
export const collectionsSelector = memoize(tsKey => createSelector(
    requestSelector(tsKey),
    state => state.series.timeSeriesCollections,
    (request, collections) => {
        if (!request || !request.timeSeriesCollections || !collections) {
            return [];
        } else {
            return request.timeSeriesCollections.map(colID => collections[colID]);
        }
    }
));


/**
 * @return {Object}     Mapping of variable IDs to variable details
 */
export const variablesSelector = createSelector(
    state => state.series.variables,
    (variables) => variables
);


/**
 * @return {Object}     Variable details for the currently selected variable.
 */
export const currentVariableSelector = createSelector(
    state => state.series.variables,
    state => state.currentVariableID,
    (variables, variableID) => {
        return variableID ? variables[variableID] : null;
    }
);


/**
 * @return {Object}     Mapping of method IDs to method details
 */
export const methodsSelector = state => state.series.methods;


/**
 * @return {Object}     Mapping of time series ID to time series details
 */
export const allTimeSeriesSelector = createSelector(
    state => state.series,
    (stateSeries) => {
        let timeSeries = {};
        if (stateSeries && stateSeries.hasOwnProperty('timeSeries')) {
            let stateTimeSeries = stateSeries.timeSeries;
            for (let key of Object.keys(stateTimeSeries)) {
                const ts = stateTimeSeries[key];
                if (ts.hasOwnProperty('points') && ts.points.length > 0) {
                    timeSeries[key] = ts;
                }
            }
        }
        return timeSeries;
    }
);


/**
 * Returns a selector that, for a given tsKey:
 * Selects all time series for the current time series variable.
 * @param  {String} tsKey   Time-series key
 * @param  {Object} state   Redux state
 * @return {Object}         Time-series data
 */
export const currentVariableTimeSeriesSelector = memoize(tsKey => createSelector(
    allTimeSeriesSelector,
    collectionsSelector(tsKey),
    currentVariableSelector,
    (timeSeries, collections, variable) => {
        return collections.filter(c => c.variable === variable.oid).reduce((series, collection) => {
            collection.timeSeries.forEach(sID => series[sID] = timeSeries[sID]);
            return series;
        }, {});
    }
));

/**
 * Returns a selector that, for a given tsKey:
 * Selects all time series data.
 * @param  {String} tsKey   Time-series key
 * @param  {Object} state   Redux state
 * @return {Object}         Time-series data
 */
export const timeSeriesSelector = memoize(tsKey => createSelector(
    allTimeSeriesSelector,
    collectionsSelector(tsKey),
    (timeSeries, collections) => {
        const a = collections.reduce((series, collection) => {
            collection.timeSeries.forEach(sID => {
                if (Object.keys(timeSeries).indexOf(sID) >= 0) {
                    series[sID] = timeSeries[sID];
                }
            });
            return series;
        }, {});
        return a;
    }
));

export const HASH_ID = {
    current: 'hash-45',
    compare: 'hash-135'
};


/**
 * Returns a selector that, for a given tsKey:
 * Returns an array of time points for all visible time series.
 * @param  {Object} state     Redux store
 * @param  {String} tsKey     Timeseries key
 * @return {Array}            Array of array of points.
 */
export const pointsSelector = memoize((tsKey) => createSelector(
    currentVariableTimeSeriesSelector(tsKey),
    (timeSeries) => {
        return Object.values(timeSeries).map(series => {
            series.points ? series.points : [];
        });
    }
));


/**
 * Returns a selector that, for a given tsKey:
 * Returns time series for the current variable.
 * @param  {Object} state     Redux store
 * @param  {String} tsKey     Timeseries key
 * @return {Array}            Array of array of points.
 */
export const currentVariableTimeseries = memoize((tsKey) => createSelector(
    timeSeriesSelector(tsKey),
    currentVariableSelector,
    (timeSeries, variable) => {
        return Object.keys(timeSeries).filter(sID => timeSeries[sID].variable === variable.oid).reduce((series, sID) => {
            series[sID] = timeSeries[sID];
            return series;
        }, {});
    }
));


/**
 * Factory function that returns a selector for a given tsKey, that:
 * Returns a single array of all points.
 * @param  {Object} state       Redux state
 * @return {Array}              Array of points.
 */
export const flatPointsSelector = memoize(tsKey => createSelector(
    pointsSelector(tsKey),
    tsPointsList => tsPointsList.reduce((finalPoints, points) => {
        Array.prototype.push.apply(finalPoints, points);
        return finalPoints;
    }, [])
));


export const classesForPoint = point => {
    return {
        approved: point.qualifiers.indexOf('A') > -1,
        estimated: point.qualifiers.indexOf('E') > -1
    };
};


/**
 * Returns an array of points for each visible timeseries.
 * @param  {Object} state     Redux store
 * @return {Array}            Array of point arrays.
 */
export const visiblePointsSelector = createSelector(
    pointsSelector('current'),
    pointsSelector('compare'),
    pointsSelector('median'),
    (state) => state.showSeries,
    (current, compare, median, showSeries) => {
        const pointArray = [];
        if (showSeries['current']) {
            Array.prototype.push.apply(pointArray, current);
        }
        if (showSeries['compare']) {
            Array.prototype.push.apply(pointArray, compare);
        }
        if (showSeries['median']) {
            Array.prototype.push.apply(pointArray, median);
        }
        return pointArray;
    }
);


/**
 * Factory function creates a function that:
 * Returns the current show state of a timeseries.
 * @param  {Object}  state     Redux store
 * @param  {String}  tsKey Timeseries key
 * @return {Boolean}           Show state of the timeseries
 */
export const isVisibleSelector = memoize(tsKey => (state) => {
    return state.showSeries[tsKey];
});


/**
 * Factory function creates a function that, for a given tsKey:
 * Returns all point data as an array of [value, time, qualifiers].
 * @param {Object} state - Redux store
 * @param {String} tsKey - timeseries key
 * @param {Array of Array} for each point returns [value, time, qualifiers] or empty array.
 */
export const pointsTableDataSelector = memoize(tsKey => createSelector(
    allTimeSeriesSelector,
    (timeSeries) => {
        return Object.keys(timeSeries).reduce((dataByTsID, tsID) => {
            const series = timeSeries[tsID];
            if (series.tsKey !== tsKey) {
                return dataByTsID;
            }

            dataByTsID[tsID] = series.points.map((value) => {
                return [
                    value.value || '',
                    value.dateTime || '',
                    value.qualifiers && value.qualifiers.length > 0 ? value.qualifiers.join(', ') : ''
                ];
            });

            return dataByTsID;
        }, {});
    }
));


/**
 * Factory function creates a function that:
 * Returns all points in a timeseries grouped into line segments, for each time series.
 * @param  {Object} state     Redux store
 * @param  {String} tsKey Timeseries key
 * @return {Array}            Array of array of points.
 */
export const lineSegmentsSelector = memoize(tsKey => createSelector(
    timeSeriesSelector(tsKey),
    (seriesMap) => {
        const seriesLines = {};
        for (const sID of Object.keys(seriesMap)) {
            const series = seriesMap[sID];
            const points = series.points;
            // Accumulate data into line groups, splitting on the estimated and
            // approval status.
            const lines = [];
            let lastClasses = {};
            const masks = new Set(Object.keys(MASK_DESC));

            for (let pt of points) {
                // Classes to put on the line with this point.
                let lineClasses = {
                    ...classesForPoint(pt),
                    dataMask: null
                };
                if (pt.value === null) {
                    let qualifiers = new Set(pt.qualifiers.map(q => q.toLowerCase()));
                    // current business rules specify that a particular data point
                    // will only have at most one masking qualifier
                    let maskIntersection = new Set([...masks].filter(x => qualifiers.has(x)));
                    lineClasses.dataMask = [...maskIntersection][0];
                }
                // If this point doesn't have the same classes as the last point,
                // create a new line for it.
                if (lastClasses.approved !== lineClasses.approved ||
                        lastClasses.estimated !== lineClasses.estimated ||
                        lastClasses.dataMask !== lineClasses.dataMask) {
                    lines.push({
                        classes: lineClasses,
                        points: []
                    });
                }

                // Add this point to the current line.
                lines[lines.length - 1].points.push(pt);

                // Cache the classes for the next loop iteration.
                lastClasses = lineClasses;
            }
            seriesLines[sID] = lines;
        }
        return seriesLines;
    }
));


/**
 * Factory function creates a function that, for a given tsKey:
 * @return {Object}     Mapping of parameter to code list of line segments arrays.
 */
export const lineSegmentsByParmCdSelector = memoize(tsKey => createSelector(
    lineSegmentsSelector(tsKey),
    timeSeriesSelector(tsKey),
    variablesSelector,
    (lineSegmentsBySeriesID, timeSeriesMap, variables) => {
        return Object.keys(lineSegmentsBySeriesID).reduce((byVarID, sID) => {
            const series = timeSeriesMap[sID];
            const parmCd = variables[series.variable].variableCode.value;
            byVarID[parmCd] = byVarID[parmCd] || [];
            byVarID[parmCd].push(lineSegmentsBySeriesID[sID]);
            return byVarID;
        }, {});
    }
));


/**
 * Factory function creates a function that, for a given tsKey:
 * Returns mapping of time series IDs to series for the current variable.
 * @return {Object}
 */
const currentVariableTimeseriesSelector = memoize(tsKey => createSelector(
    timeSeriesSelector(tsKey),
    currentVariableSelector,
    (seriesMap, variable) => {
        return Object.keys(seriesMap).filter(
                sID => seriesMap[sID].variable === variable.oid).reduce((curMap, sID) => {
            curMap[sID] = seriesMap[sID];
            return curMap;
        }, {});
    }
));


/**
 * Factory function creates a function that, for a given tsKey:
 * Returns mapping of series ID to line segments for the currently selected variable.
 * @return {Object}
 */
export const currentVariableLineSegmentsSelector = memoize(tsKey => createSelector(
    currentVariableTimeseriesSelector(tsKey),
    lineSegmentsSelector(tsKey),
    (seriesMap, linesMap) => {
        return Object.keys(seriesMap).reduce((visMap, sID) => {
            visMap[sID] = linesMap[sID];
            return visMap;
        }, {});
    }
));


/**
 * @return {String}     The label for the y-axis
 */
export const yLabelSelector = createSelector(
    currentVariableSelector,
    variable => variable ? variable.variableDescription : ''
);


/**
 * @return {String}     The label for the y-axis, used by addSVGAccessibility
 */
export const titleSelector = createSelector(
    currentVariableSelector,
    variable => variable ? variable.variableName : ''
);


/**
 * @return {String}     Description for the currently display set of time
 *                      series, used by addSVGAccessibility.
 */
export const descriptionSelector = createSelector(
    currentVariableSelector,
    timeSeriesSelector('current'),
    (variable, timeSeries) => {
        const desc = variable ? variable.variableDescription : '';
        const startTime = new Date(Math.min.apply(null, Object.values(timeSeries).map(ts => ts.startTime)));
        const endTime = new Date(Math.max.apply(null, Object.values(timeSeries).map(ts => ts.endTime)));
        return `${desc} from ${formatTime(startTime)} to ${formatTime(endTime)}`;
    }
);
