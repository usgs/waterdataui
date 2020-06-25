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
import './helpers.spec';
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

import './lib/d3-redux.spec';

import './monitoring-location/components/daily-value-hydrograph/selectors/labels.spec';
import './monitoring-location/components/daily-value-hydrograph/selectors/legend-data.spec';
import './monitoring-location/components/daily-value-hydrograph/selectors/scales.spec';
import './monitoring-location/components/daily-value-hydrograph/selectors/time-series-data.spec';
import './monitoring-location/components/daily-value-hydrograph/graph-brush.spec';
import './monitoring-location/components/daily-value-hydrograph/index.spec';
import './monitoring-location/components/daily-value-hydrograph/time-series-graph.spec';
import './monitoring-location/components/daily-value-hydrograph/tooltip.spec';

import './monitoring-location/components/embed.spec';

import './monitoring-location/components/hydrograph/audible.spec';
import './monitoring-location/components/hydrograph/cursor.spec';
import './monitoring-location/components/hydrograph/date-controls.spec';
import './monitoring-location/components/hydrograph/domain.spec';
import './monitoring-location/components/hydrograph/drawing-data.spec';
import './monitoring-location/components/hydrograph/data-table.spec';
import './monitoring-location/components/hydrograph/graph-brush.spec';
import './monitoring-location/components/hydrograph/graph-controls.spec';
import './monitoring-location/components/hydrograph/index.spec';
import './monitoring-location/components/hydrograph/layout.spec';
import './monitoring-location/components/hydrograph/legend.spec';
import './monitoring-location/components/hydrograph/method-picker.spec';
import './monitoring-location/components/hydrograph/parameters.spec';
import './monitoring-location/components/hydrograph/scales.spec';
import './monitoring-location/components/hydrograph/time-series.spec';
import './monitoring-location/components/hydrograph/time-series-graph.spec';
import './monitoring-location/components/hydrograph/tooltip.spec';

import './monitoring-location/components/map/flood-slider.spec';
import './monitoring-location/components/map/index.spec';
import './monitoring-location/components/map/legend.spec';

import './monitoring-location/selectors/daily-value-time-series-selector.spec';
import './monitoring-location/selectors/flood-data-selector.spec';
import './monitoring-location/selectors/network-selector.spec';
import './monitoring-location/selectors/nldi-data-selector.spec';
import './monitoring-location/selectors/median-statistics-selector.spec';
import './monitoring-location/selectors/time-series-selector.spec';
import './monitoring-location/selectors/time-zone-selector.spec';

import './monitoring-location/store/daily-value-time-series.spec';
import './monitoring-location/store/flood-inundation.spec';
import './monitoring-location/store/instantaneous-value-time-series-data.spec';
import './monitoring-location/store/instantaneous-value-time-series-state.spec';
import './monitoring-location/store/network.spec';
import './monitoring-location/store/nldi-data.spec';
import './monitoring-location/store/statistics-data.spec';
import './monitoring-location/store/time-zone.spec';
import './monitoring-location/store/ui-state.spec';

import './monitoring-location/url-params.spec';

import './network/components/network-sites/index.spec';
import './network/components/network-sites/legend.spec';
import './network/selectors/network-data-selector.spec';
import './network/store/network-store.spec';
import './network/store/network-data-reducer.spec';

import './web-services/flood-data.spec';
import './web-services/models.spec';
import './web-services/network-data.spec';
import './web-services/nldi-data.spec';
import './web-services/observations.spec';
import './web-services/statistics-data.spec';

