const { normalize: normalizr, schema } = require('normalizr');


// sourceInfo schema
const siteCode = new schema.Entity('siteCode', {}, {idAttribute: 'value'});
const timeZone = new schema.Entity('timeZone', {}, {idAttribute: 'zoneAbbreviation'});
const timeZoneInfo = new schema.Entity('timeZoneInfo', {
    defaultTimeZone: timeZone,
    daylightSavingsTimeZone: timeZone
}, {idAttribute: value => `${value.daylightSavingsTimeZone.zoneAbbreviation}:${value.defaultTimeZone.zoneAbbreviation}:${value.siteUsesDaylightSavingsTime}`});
const sourceInfo = new schema.Entity('sourceInfo', {
    siteCode: [siteCode],
    timeZoneInfo: timeZoneInfo
}, {idAttribute: value => value.siteCode.map(s => s.value).join(':')});

// variable schema
const variableCode = new schema.Entity('variableCode', {}, {idAttribute: 'value'});
const option = new schema.Entity('options', {}, {idAttribute: 'optionCode'});
const variable = new schema.Entity('variable', {
    variableCode: [variableCode],
    options: [option]
}, {
    idAttribute: 'oid',
    processStrategy: (variable) => {
        // Eliminate unnecessary nesting on options attribute
        return {
            ...variable,
            options: variable.options.option
        };
    }
});

// timeSeries schema
const qualifier = new schema.Entity('qualifiers', {}, {idAttribute: 'qualifierCode'});
const method = new schema.Entity('methods', {}, {idAttribute: 'methodID'});
const timeSeries = tsKey => new schema.Entity('timeSeries', {
    qualifier: [qualifier],
    method: [method]
}, {
    idAttribute: value => `${value.method.map(m => m.methodID).join(':')}:${tsKey}`,
    processStrategy: (ts, parent) => {
        // Return processed data, with date strings converted to Date objects
        // and the "value" attribute renamed to "points".
        const data = {
            ...ts,
            tsKey,
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
});

// timeSeriesCollection schema
const queryInfo = tsKey => new schema.Entity('queryInfo', {}, {idAttribute: () => tsKey});
const timeSeriesCollection = tsKey => new schema.Entity('timeSeriesCollections', {
    sourceInfo: sourceInfo,
    timeSeries: [timeSeries(tsKey)],
    variable: variable
}, {
    idAttribute: value => {
        return `${value.name}:${tsKey}`;
    },
    processStrategy: value => {
        // Rename "values" attribute to "timeSeries"
        const collection = {
            ...value,
            timeSeries: value.values
        };
        delete collection['values'];
        return collection;
    }
});

// Top-level request schema
const request = tsKey => new schema.Entity('request', {
    queryInfo: queryInfo(tsKey),
    timeSeriesCollection: [timeSeriesCollection(tsKey)]
}, {
    idAttribute: () => tsKey,
    processStrategy: root => {
        // Flatten the response data - we only need the data in "value"
        // Also, rename timeSeries to timeSeriesCollection.
        return {
            queryInfo: root.value.queryInfo,
            timeSeriesCollection: root.value.timeSeries
        };
    }
});

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
