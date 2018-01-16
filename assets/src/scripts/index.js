// Initialize the 18F Web design standards
require('uswds');

const { getTimeseries } = require('./models');
const Hydrograph = require('./hydrograph');


function main() {
    let nodes = document.getElementsByClassName('hydrograph');
    for (let node of nodes) {
        getTimeseries({sites: [node.dataset.siteno]}, series => {
            let dataIsValid = series[0] && !series[0].values.some(d => d.value == -999999);
            new Hydrograph({
                element: node,
                data: dataIsValid ? series[0].values : [],
                yLabel: dataIsValid ? series[0].description : 'No data',
                title: dataIsValid ? series[0].variableName : '',
                desc: dataIsValid ? series[0].variableDescription + ' from ' + series[0].seriesStartDate + ' to ' + series[0].seriesEndDate: ''
            });
        });
    }
}

if (document.readyState !== 'loading') {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main, false);
}
