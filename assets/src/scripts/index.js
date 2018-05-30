import 'matchmedia-polyfill';

// Initialize the 18F Web design standards
import 'uswds';

// Load misc Javascript helpers for general page interactivity.
import { register } from './helpers';
register();

import { configureStore } from './store';

import { attachToNode as EmbedComponent } from './components/embed';
import { attachToNode as HydrographComponent } from './components/hydrograph';
import { attachToNode as MapComponent } from './components/map';

const COMPONENTS = {
    embed: EmbedComponent,
    hydrograph: HydrographComponent,
    map: MapComponent
};

function main() {
    // NOTE: Here we use a try/catch block rather than a global "onerror"
    // handler, because Babel's polyfills strip some of the exception data out.
    // This method retains access to the exception object.
    try {
        let nodes = document.getElementsByClassName('wdfn-component');
        let store = configureStore({
            ui: {
                windowWidth: window.innerWidth
            }
        });
        for (let node of nodes) {
            // If options is specified on the node, expect it to be a JSON string.
            // Otherwise, use the dataset attributes as the component options.
            const options = node.dataset.options ? JSON.parse(node.dataset.options) : node.dataset;
            COMPONENTS[node.dataset.component](store, node, options);
        }

    } catch (err) {
        // Send exception to Google Analytics.
        if (window.ga) {
            window.ga('send', 'exception', {
                // exDescription will be truncated at 150 bytes
                exDescription: err.stack,
                exFatal: true
            });
        }
        throw err;
    }
}


if (document.readyState !== 'loading') {
    main();
} else {
    document.addEventListener('DOMContentLoaded', main, false);
}

// Leaflet expects an exports global to exist - so although we don't use this,
// just set it to something so it's not undefined.
export var dummy = true;
