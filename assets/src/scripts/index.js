// Initialize the 18F Web design standards
require('uswds');

// Load misc Javascript helpers for general page interactivity.
require('./helpers').register();

const { configureStore } = require('./store');


const COMPONENTS = {
    embed: require('./components/embed').attachToNode,
    hydrograph: require('./components/hydrograph').attachToNode,
    map: require('./components/map').attachToNode,
    floodSlider: require('./components/floodSlider').attachToNode
};


function main() {
    // NOTE: Here we use a try/catch block rather than a global "onerror"
    // handler, because Babel's polyfills strip some of the exception data out.
    // This method retains access to the exception object.
    try {
        let nodes = document.getElementsByClassName('wdfn-component');
        let store = configureStore({
            windowWidth: window.innerWidth
        });
        for (let node of nodes) {
            COMPONENTS[node.dataset.component](store, node, node.dataset);
        }
    } catch (err) {
        // Send exception to Google Analytics.
        window.ga('send', 'exception', {
            // exDescription will be truncated at 150 bytes
            exDescription: err.stack,
            exFatal: true
        });
        throw err;
    }
}


if (document.readyState !== 'loading') {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main, false);
}
