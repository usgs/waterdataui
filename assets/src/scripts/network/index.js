import 'ui/polyfills';

import wdfnviz from 'wdfn-viz';

import {configureStore} from './store';

import {attachToNode as NetworkMapComponent} from './components/network-sites';

const COMPONENTS = {
    'network': NetworkMapComponent
};

const load = function() {
    let nodes = document.getElementsByClassName('wdfn-component');
    let store = configureStore();
    for (let node of nodes) {
        // If options is specified on the node, expect it to be a JSON string.
        // Otherwise, use the dataset attributes as the component options.
        const options = node.dataset.options ? JSON.parse(node.dataset.options) : node.dataset;
        COMPONENTS[node.dataset.component](store, node, Object.assign({}, options));
    }


};

wdfnviz.main(load);



// Leaflet expects an exports global to exist - so although we don't use this,
// just set it to something so it's not undefined.
export var dummy = true;