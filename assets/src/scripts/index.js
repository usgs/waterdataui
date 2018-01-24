// Initialize the 18F Web design standards
require('uswds');
const { timeFormat, utcFormat } = require('d3-time-format');

const { getTimeseries } = require('./models');
const Hydrograph = require('./hydrograph');
const { get } = require('./ajax');

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
    let hydrograph;
    let getLastYearTS;
    for (let node of nodes) {
        getTimeseries({sites: [node.dataset.siteno]}).then((series) => {
            let dataIsValid = series && series[0] && !series[0].values.some(d => d.value === -999999);
            hydrograph = new Hydrograph({
                element: node,
                data: dataIsValid ? series[0].values : [],
                yLabel: dataIsValid ? series[0].variableDescription : 'No data',
                title: dataIsValid ? series[0].variableName : '',
                desc: dataIsValid ? series[0].variableDescription + ' from ' + formatTime(series[0].seriesStartDate) + ' to ' + formatTime(series[0].seriesEndDate) : ''
            });
            if (dataIsValid) {
                getLastYearTS = getLastYearTimeseries({
                    site: node.dataset.siteno,
                    startTime: series[0].seriesStartDate,
                    endTime: series[0].seriesEndDate
                });//.then((series) => {
                  //  hydrograph.addTimeSeries({data: series[0].values, legendLabel: 'Last Year'});
                //});
            }
        }, () =>
            hydrograph = new Hydrograph({
                element: node,
                data: []
            })
        );
    }

    document.getElementById('show-last-year-input').addEventListener('change', (evt) =>
        getLastYearTS.then((series) => {
            hydrograph.addTimeSeries({
                data: series[0].values,
                legendLabel: 'lastyear'
            });
        })
     );
}

if (document.readyState !== 'loading') {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main, false);
}
