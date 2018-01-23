// Initialize the 18F Web design standards
require('uswds');
const { timeFormat } = require('d3-time-format');

const { getTimeseries } = require('./models');
const Hydrograph = require('./hydrograph');

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');

function getLastYearTimeseries({site, startTime, endTime}) {
    let lastYearStartTime = new Date(startTime.getTime());
    let lastYearEndTime = new Date(endTime.getTime());

    lastYearStartTime.setFullYear(startTime.getFullYear() - 1);
    lastYearEndTime.setFullYear(endTime.getFullYear() - 1);

    return getTimeseries({sites: [site], startDate: lastYearStartTime, endDate: lastYearEndTime});
}

function main() {
    let nodes = document.getElementsByClassName('hydrograph');
    for (let node of nodes) {
        let getPromise = getTimeseries({sites: [node.dataset.siteno]}).then((series) => {
            let dataIsValid = series && series[0] && !series[0].values.some(d => d.value === -999999);
            new Hydrograph({
                element: node,
                data: dataIsValid ? series[0].values : [],
                yLabel: dataIsValid ? series[0].variableDescription : 'No data',
                title: dataIsValid ? series[0].variableName : '',
                desc: dataIsValid ? series[0].variableDescription + ' from ' + formatTime(series[0].seriesStartDate) + ' to ' + formatTime(series[0].seriesEndDate) : ''
            });
            getTimeseries({sites: [node.dataset.siteno], startDate: new Date('2018-01-01'), endDate: new Date('2018-01-08')})
                .then((data) => {
                    console.log('Fetching last year time series');
            });
        }, () =>
            new Hydrograph({
                element: node,
                data: []
            })
        )
    }
}

if (document.readyState !== 'loading') {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main, false);
}
