import './polyfills';

// Initialize the 18F Web design standards
import wdfnviz from 'wdfn-viz';

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

const load = function () {
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


};

wdfnviz.main(load);



// Leaflet expects an exports global to exist - so although we don't use this,
// just set it to something so it's not undefined.
export var dummy = true;
