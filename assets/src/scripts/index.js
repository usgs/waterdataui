// Initialize the 18F Web design standards
require('uswds');
const { timeFormat } = require('d3-time-format');

const { getTimeseries, readIV, parseRDB } = require('./models');
const Hydrograph = require('./hydrograph');
const { get } = require("./ajax");

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');

function main() {
    let nodes = document.getElementsByClassName('hydrograph');
    for (let node of nodes) {
        let siteno = node.dataset.siteno;
        let params = params=['00060'];
        let timeSeriesUrl = `${SERVICE_ROOT}/iv/?sites=${[siteno].join(',')}&parameterCd=${params.join(',')}&period=P7D&indent=on&siteStatus=all&format=json`;
        let timeSeries = get(timeSeriesUrl);
        console.log(timeSeries);
        let medianUrl = 'https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=' + siteno + '&statReportType=daily&statTypeCd=median&parameterCd=00060';
        let median = get(medianUrl);
        Promise.all([timeSeries, median]).then(function(values) {
            let timeSeriesVals = readIV(values[0]);
            console.log(timeSeriesVals);
            let medianVals = values[1];
        });
        /*
        getTimeseries({sites: [siteno]}, series => {
            let medianUrl = 'https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=' + siteno + '&statReportType=daily&statTypeCd=median&parameterCd=00060'
            let median = get(medianUrl);
            let dataIsValid = series[0] && !series[0].values.some(d => d.value === -999999);
            hydrograph = new Hydrograph({
                element: node,
                data: dataIsValid ? series[0].values : [],
                yLabel: dataIsValid ? series[0].variableDescription : 'No data',
                title: dataIsValid ? series[0].variableName : '',
                medianPromise: median,
                desc: dataIsValid ? series[0].variableDescription + ' from ' + formatTime(series[0].seriesStartDate) + ' to ' + formatTime(series[0].seriesEndDate) : ''
            });
        });
        */
    }
}

if (document.readyState !== 'loading') {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main, false);
}
