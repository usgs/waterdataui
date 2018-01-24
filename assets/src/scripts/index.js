// Initialize the 18F Web design standards
require('uswds');
const { timeFormat } = require('d3-time-format');

const { getTimeseries } = require('./models');
const { parseRDB } = require('./models');
const Hydrograph = require('./hydrograph');
const { get } = require("./ajax");

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');

function main() {
    let nodes = document.getElementsByClassName('hydrograph');
    for (let node of nodes) {
        let siteno = node.dataset.siteno;
        getTimeseries({sites: [siteno]}, series => {
            let dataIsValid = series[0] && !series[0].values.some(d => d.value === -999999);
            new Hydrograph({
                element: node,
                data: dataIsValid ? series[0].values : [],
                yLabel: dataIsValid ? series[0].variableDescription : 'No data',
                title: dataIsValid ? series[0].variableName : '',
                desc: dataIsValid ? series[0].variableDescription + ' from ' + formatTime(series[0].seriesStartDate) + ' to ' + formatTime(series[0].seriesEndDate) : ''
            });
        });
        let medianUrl = 'https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=' + siteno + '&statReportType=daily&statTypeCd=median&parameterCd=00060'
        get(medianUrl).then(function(result) {
            let medianData = parseRDB(result);
            new Hydrograph({
                element: node,
                data: medianData
            });
        });
    }
}

if (document.readyState !== 'loading') {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main, false);
}
