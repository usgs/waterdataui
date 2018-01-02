const request = require('request');

const SERVICE_ROOT = 'https://waterservices.usgs.gov/nwis';


export function getTimeseries({sites, params}, callback) {
    params = params || ['00060'];
    request.get(
        `${SERVICE_ROOT}/iv/?sites=${sites.join(',')}&parameterCd=${params.join(',')}&period=P7D&indent=on&siteStatus=all&format=json`,
        {json: true},
        (error, response, body) => {
            if (error) {
                callback(null, error);
                return;
            }
            if (response.statusCode != 200) {
                callback(null, 'Unexpected error');
                return;
            }
            // Pass timeseries data to callback.
            callback(body.value.timeSeries.map(series => {
                return {
                    code: series.variable.variableCode[0].variableID,
                    description: series.variable.variableDescription,
                    values: series.values[0].value.map(value => {
                        let date = new Date(value.dateTime);
                        return {
                            time: date,
                            value: parseInt(value.value),
                            label: `${date.toLocaleDateString()}\n${value.value} ${series.variable.unit.unitCode}`
                        };
                    })
                };
            }));
        }
    );
}
