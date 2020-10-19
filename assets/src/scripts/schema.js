import memoize from 'fast-memoize';
import {normalize as normalizr, schema} from 'normalizr';
import {replaceHtmlEntities} from 'ui/utils';


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
            points: ts.value.map(v => {
                const value = parseFloat(v.value);
                return {
                    ...v,
                    dateTime: new Date(v.dateTime).getTime(),
                    value: value === parent.variable.noDataValue ? null : value
                };
            })
        };
        delete data.value;
        return data;
    }
}));

// timeSeriesCollection schema
const queryInfo = memoize(tsKey => new schema.Entity('queryInfo', {}, {
    idAttribute: () => tsKey,
    processStrategy: value => {
        const queryInfo = {
            ...value,
            notes: value.note.reduce((notes, note) => {
                notes[note.title] = note.value;
                return notes;
            }, {})
        };
        delete queryInfo.note;

        // Extract values out of filter:timeRange
        // If this is a "period" query (eg, P7D)
        if (queryInfo.notes['filter:timeRange'].indexOf('PERIOD') > -1) {
            const regEx = /\[mode=(.+), period=P(.+)D, modifiedSince=(.+)\]/;
            const parts = regEx.exec(queryInfo.notes['filter:timeRange']);
            queryInfo.notes['filter:timeRange'] = {
                mode: parts[1],
                periodDays: parts[2],
                modifiedSince: parts[3] === 'null' ? null : parts[3]
            };

        // If this is a "range" query (start and end times specified)
        } else if (queryInfo.notes['filter:timeRange'].indexOf('RANGE') > -1) {
            const regEx = /\[mode=(.+), modifiedSince=(.+)\] interval={INTERVAL\[(.+)\/(.+)\]}/;
            const parts = regEx.exec(queryInfo.notes['filter:timeRange']);
            queryInfo.notes['filter:timeRange'] = {
                mode: parts[1],
                modifiedSince: parts[2] === 'null' ? null : parts[3],
                interval: {
                    start: new Date(parts[3]).getTime(),
                    end: new Date(parts[4]).getTime()
                }
            };
        } else {
            console.error(`Can't make sense of time range string: ${queryInfo.notes['filter:timeRange']}`);
        }

        // Store requestDT as a date object
        queryInfo.notes.requestDT = new Date(queryInfo.notes.requestDT).getTime();

        return queryInfo;
    }
}));
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
export const normalize = function(ivData, tsKey) {
    return normalizr(ivData, request(tsKey)).entities;
};
