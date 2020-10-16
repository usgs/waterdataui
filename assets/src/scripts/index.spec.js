/**
 * This is an entrypoint for the Karma test runner. All tests should be
 * explicitly added here, or they won't be run as part of the test suite.
 *
 * This exists to speed up the execution time of the test suite. The
 * tests and the application dependencies only need to be compiled a single
 * time, and `karma --watch` tasks are very fast.
 */

import './mock-service-data';
import './polyfills';

import './ajax.spec';
import './schema.spec';
import './tooltips.spec';
import './utils.spec';

import './d3-rendering/accessibility.spec';
import './d3-rendering/alerts.spec';
import './d3-rendering/axes.spec';
import './d3-rendering/cursor-slider.spec';
import './d3-rendering/data-masks.spec';
import './d3-rendering/graph-tooltip.spec';
import './d3-rendering/legend.spec';
import './d3-rendering/loading-indicator.spec';
import './d3-rendering/markers.spec';
import './d3-rendering/tick-marks.spec';

import './leaflet-rendering/map.spec';
import './leaflet-rendering/legend-control.spec';

import './lib/d3-redux.spec';

import 'ml/components/daily-value-hydrograph/selectors/labels.spec';
import 'ml/components/daily-value-hydrograph/selectors/legend-data.spec';
import 'ml/components/daily-value-hydrograph/selectors/scales.spec';
import 'ml/components/daily-value-hydrograph/selectors/time-series-data.spec';
import 'ml/components/daily-value-hydrograph/graph-brush.spec';
import 'ml/components/daily-value-hydrograph/graph-controls.spec';
import 'ml/components/daily-value-hydrograph/index.spec';
import 'ml/components/daily-value-hydrograph/time-series-graph.spec';
import 'ml/components/daily-value-hydrograph/tooltip.spec';

import 'ml/components/embed.spec';

import 'ml/components/hydrograph/selectors/cursor.spec';
import 'ml/components/hydrograph/selectors/domain.spec';
import 'ml/components/hydrograph/selectors/drawing-data.spec';
import 'ml/components/hydrograph/selectors/layout.spec';
import 'ml/components/hydrograph/selectors/parameter-data.spec';
import 'ml/components/hydrograph/selectors/scales.spec';
import 'ml/components/hydrograph/selectors/time-series-data.spec';

import 'ml/components/hydrograph/audible.spec';
import 'ml/components/hydrograph/date-controls.spec';
import 'ml/components/hydrograph/data-table.spec';
import 'ml/components/hydrograph/graph-brush.spec';
import 'ml/components/hydrograph/graph-controls.spec';
import 'ml/components/hydrograph/hydrograph-utils.spec';
import 'ml/components/hydrograph/index.spec';
import 'ml/components/hydrograph/legend.spec';
import 'ml/components/hydrograph/method-picker.spec';
import 'ml/components/hydrograph/parameters.spec';
import 'ml/components/hydrograph/time-series-graph.spec';
import 'ml/components/hydrograph/tooltip.spec';

import 'ml/components/map/flood-slider.spec';
import 'ml/components/map/index.spec';
import 'ml/components/map/legend.spec';

import 'ml/selectors/daily-value-time-series-selector.spec';
import 'ml/selectors/flood-data-selector.spec';
import 'ml/selectors/network-selector.spec';
import 'ml/selectors/nldi-data-selector.spec';
import 'ml/selectors/median-statistics-selector.spec';
import 'ml/selectors/time-series-selector.spec';
import 'ml/selectors/time-zone-selector.spec';

import 'ml/store/daily-value-time-series.spec';
import 'ml/store/flood-inundation.spec';
import 'ml/store/instantaneous-value-time-series-data.spec';
import 'ml/store/instantaneous-value-time-series-state.spec';
import 'ml/store/network.spec';
import 'ml/store/nldi-data.spec';
import 'ml/store/statistics-data.spec';
import 'ml/store/time-zone.spec';
import 'ml/store/ui-state.spec';

import 'ml/url-params.spec';
import './network/components/network-sites/data-table.spec';
import './network/components/network-sites/index.spec';
import './network/components/network-sites/legend.spec';
import './network/selectors/network-data-selector.spec';
import './network/store/index.spec';
import './network/store/network-data-reducer.spec';

import './web-services/flood-data.spec';
import './web-services/models.spec';
import './web-services/network-data.spec';
import './web-services/nldi-data.spec';
import './web-services/observations.spec';
import './web-services/statistics-data.spec';
