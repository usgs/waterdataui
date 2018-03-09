const memoize = require('fast-memoize');
const { normalize: normalizr, schema } = require('normalizr');

const { replaceHtmlEntities } = require('./utils');


// sourceInfo schema
const siteCode = new schema.Entity('siteCodes', {}, {idAttribute: 'value'});
const timeZone = new schema.Entity('timeZones', {}, {idAttribute: 'zoneAbbreviation'});
const timeZoneInfo = new schema.Entity('timeZoneInfo', {
    defaultTimeZone: timeZone,
    daylightSavingsTimeZone: timeZone
}, {idAttribute: value => `${value.daylightSavingsTimeZone.zoneAbbreviation}:${value.defaultTimeZone.zoneAbbreviation}:${value.siteUsesDaylightSavingsTime}`});
const sourceInfo = new schema.Entity('sourceInfo', {
    siteCode: [siteCode],
    timeZoneInfo: timeZoneInfo
}, {idAttribute: value => value.siteCode.map(s => s.value).join(':')});

// variable schema
const option = new schema.Entity('options', {}, {idAttribute: 'optionCode'});
const variable = new schema.Entity('variables', {
    options: [option]
}, {
    idAttribute: 'oid',
    processStrategy: (variable) => {
        // Eliminate unnecessary nesting on options and variableCode attributes
        return {
            ...variable,
            options: variable.options.option,
            variableName: replaceHtmlEntities(variable.variableName),
            variableCode: variable.variableCode[0]
        };
    }
});

// timeSeries schema
const qualifier = new schema.Entity('qualifiers', {}, {idAttribute: 'qualifierCode'});
const method = new schema.Entity('methods', {}, {idAttribute: 'methodID'});
const timeSeries = memoize(tsKey => new schema.Entity('timeSeries', {
    qualifier: [qualifier],
    method: method,
    variable: variable
}, {
    idAttribute: value => `${value.method.map(m => m.methodID).join(':')}:${tsKey}`,
    processStrategy: (ts, parent) => {
        // Return processed data, with date strings converted to Date objects.
        // the "value" attribute renamed to "points", and start and end times
        // added. Also flatten to a single method.
        if (ts.method.length !== 1) {
            console.error('Single method assumption violated');
        }
        const data = {
            ...ts,
            tsKey,
            method: ts.method[0],
            startTime: ts.value.length ?
                new Date(ts.value[0].dateTime) : null,
            endTime: ts.value.length ?
                new Date(ts.value.slice(-1)[0].dateTime) : null,
            points: ts.value.map(v => {
                const value = parseFloat(v.value);
                return {
                    ...v,
                    dateTime: new Date(v.dateTime),
                    value: value === parent.variable.noDataValue ? null : value
                };
            })
        };
        delete data.value;
        return data;
    }
}));

// timeSeriesCollection schema
const queryInfo = memoize(tsKey => new schema.Entity('queryInfo', {}, {idAttribute: () => tsKey}));
const timeSeriesCollection = memoize(tsKey => new schema.Entity('timeSeriesCollections', {
    sourceInfo: sourceInfo,
    timeSeries: [timeSeries(tsKey)],
    variable: variable
}, {
    idAttribute: value => {
        return `${value.name}:${tsKey}`;
    },
    processStrategy: value => {
        // Rename "values" attribute to "timeSeries", and - because it
        // significantly simplifies selector logic - also store the variable ID
        // on the timeSeries object.
        const collection = {
            ...value,
            timeSeries: value.values.map(ts => {
                return {
                    ...ts,
                    variable: value.variable
                };
            })
        };
        delete collection['values'];
        return collection;
    }
}));

// Top-level request schema
const request = memoize(tsKey => new schema.Entity('requests', {
    queryInfo: queryInfo(tsKey),
    timeSeriesCollections: [timeSeriesCollection(tsKey)]
}, {
    idAttribute: () => tsKey,
    processStrategy: root => {
        // Flatten the response data - we only need the data in "value"
        // Also, rename timeSeries to timeSeriesCollections.
        return {
            queryInfo: root.value.queryInfo,
            timeSeriesCollections: root.value.timeSeries
        };
    }
}));

/**
 * Flattens an IV service JSON response into a normalized entity mapping.
 * @param  {Object} ivData JSON version of WaterML data
 * @param  {String} tsKey  Time series key. eg, "current"
 * @return {Object}        Normalized entities
 */
const normalize = function (ivData, tsKey) {
    return normalizr(ivData, request(tsKey)).entities;
};


module.exports = {normalize};
