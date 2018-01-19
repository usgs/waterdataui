// Initialize the 18F Web design standards
require('uswds');
const { timeFormat } = require('d3-time-format');

const { getTimeseries } = require('./models');
const Hydrograph = require('./hydrograph');

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');

function main() {
    let nodes = document.getElementsByClassName('hydrograph');
    for (let node of nodes) {
        getTimeseries({sites: [node.dataset.siteno]}).then((series) => {
            let dataIsValid = series && series[0] && !series[0].values.some(d => d.value === -999999);
            new Hydrograph({
                element: node,
                data: dataIsValid ? series[0].values : [],
                yLabel: dataIsValid ? series[0].description : 'No data',
                title: dataIsValid ? series[0].variableName : '',
                desc: dataIsValid ? series[0].variableDescription + ' from ' + formatTime(series[0].seriesStartDate) + ' to ' + formatTime(series[0].seriesEndDate) : ''
            });
        }, () =>
            new Hydrograph({
                element: node,
                data: []
            })
        );
    }
}

if (document.readyState !== 'loading') {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main, false);
}
