
// Initialize the 18F Web design standards
require('uswds');



const COMPONENTS = {
    hydrograph: require('./components/hydrograph').attachToNode,
    map: require('./components/map').attachToNode
};


function main() {
    let nodes = document.getElementsByClassName('wdfn-component');
    for (let node of nodes) {
        COMPONENTS[node.dataset.component](node, node.dataset);
    }
}


if (document.readyState !== 'loading') {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main, false);
}
