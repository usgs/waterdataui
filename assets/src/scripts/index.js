// Initialize the 18F Web design standards
require('uswds');

const { getTimeseries } = require('./models');
const Hydrograph = require('./components/hydrograph');


document.addEventListener('DOMContentLoaded', function () {
    let nodes = document.getElementsByClassName('hydrograph');
    for (let node of nodes) {
        getTimeseries({sites: [node.dataset.siteno]}, series => {
            let dataIsValid = series[0] && !series[0].values.some(d => d.value == -999999);
            new Hydrograph({
                element: node,
                data: dataIsValid ? series[0].values : [],
                title: dataIsValid ? series[0].description : 'No data'
            });
        });
    }
}, false);
