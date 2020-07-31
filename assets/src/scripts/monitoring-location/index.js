import '../polyfills';

import wdfnviz from 'wdfn-viz';

// Load misc Javascript helpers for general page interactivity.
import {register} from '../helpers';
register();

import 'uswds'

// window.uswds = require("/node_modules/uswds/dist/js/uswds");

import {getParamString} from './url-params';

import {configureStore} from './store';
import {Actions as uiActions} from './store/ui-state';

import {attachToNode as EmbedComponent} from './components/embed';
import {attachToNode as DailyValueHydrographComponent} from './components/daily-value-hydrograph';
import {attachToNode as HydrographComponent} from './components/hydrograph';
import {attachToNode as MapComponent} from './components/map';
import {attachToNode as NetworkListComponent} from './components/network-list';

const COMPONENTS = {
    embed: EmbedComponent,
    'dv-hydrograph': DailyValueHydrographComponent,
    hydrograph: HydrographComponent,
    map: MapComponent,
    'network-list': NetworkListComponent
};

const load = function () {
    let pageContainer = document.getElementById('monitoring-location-page-container');
    let store = configureStore({
        ui: {
            windowWidth: window.innerWidth,
            width: pageContainer.offsetWidth
        }
    });
    let nodes = document.getElementsByClassName('wdfn-component');
    for (let node of nodes) {
        // If options is specified on the node, expect it to be a JSON string.
        // Otherwise, use the dataset attributes as the component options.
        const options = node.dataset.options ? JSON.parse(node.dataset.options) : node.dataset;
        const hashOptions = Object.fromEntries(new window.URLSearchParams(getParamString()));
        COMPONENTS[node.dataset.component](store, node, Object.assign({}, options, hashOptions));
    }

    window.onresize = function() {
        store.dispatch(uiActions.resizeUI(window.innerWidth, pageContainer.offsetWidth));
    };
};

wdfnviz.main(load);

// Leaflet expects an exports global to exist - so although we don't use this,
// just set it to something so it's not undefined.
export var dummy = true;
