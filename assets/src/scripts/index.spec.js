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

import './d3-rendering/accessibility.spec';
import './d3-rendering/alerts.spec';
import './d3-rendering/axes.spec';
import './d3-rendering/cursor-slider.spec';
import './d3-rendering/graph-tooltip.spec';
import './d3-rendering/legend.spec';
import './d3-rendering/loading-indicator.spec';
import './d3-rendering/markers.spec';
import './d3-rendering/tick-marks.spec';

import './components/daily-value-hydrograph/selectors/labels.spec';
import './components/daily-value-hydrograph/selectors/legend-data.spec';
import './components/daily-value-hydrograph/selectors/scales.spec';
import './components/daily-value-hydrograph/selectors/time-series-data.spec';

import './components/daily-value-hydrograph/graph-brush.spec';
import './components/daily-value-hydrograph/index.spec';
import './components/daily-value-hydrograph/time-series-graph.spec';
import './components/daily-value-hydrograph/tooltip.spec';

import './components/embed.spec';

import './components/hydrograph/audible.spec';
import './components/hydrograph/cursor.spec';
import './components/hydrograph/date-controls.spec';
import './components/hydrograph/domain.spec';
import './components/hydrograph/drawing-data.spec';
import './components/hydrograph/graph-brush.spec';
import './components/hydrograph/graph-controls.spec';
import './components/hydrograph/index.spec';
import './components/hydrograph/layout.spec';
import './components/hydrograph/legend.spec';
import './components/hydrograph/method-picker.spec';
import './components/hydrograph/parameters.spec';
import './components/hydrograph/scales.spec';
import './components/hydrograph/time-series.spec';
import './components/hydrograph/time-series-graph.spec';
import './components/hydrograph/tooltip.spec';

import './components/map/flood-slider.spec';
import './components/map/index.spec';
import './components/map/legend.spec';

import './helpers.spec';

import './lib/d3-redux.spec';

import './schema.spec';

import './selectors/daily-value-time-series-selector.spec';
import './selectors/flood-data-selector.spec';
import './selectors/nldi-data-selector.spec';
import './selectors/median-statistics-selector.spec';
import './selectors/time-series-selector.spec';

import './store/daily-value-time-series.spec';
import './store/flood-inundation.spec';
import './store/index.spec';
import './store/nldi-data.spec';
import './store/series-reducer.spec';
import './store/statistics-data.spec';
import './store/time-series-state-reducer.spec';
import './store/ui-state.spec';

import './tooltips.spec';
import './url-params.spec';
import './utils.spec';

import './web-services/flood-data.spec';
import './web-services/models.spec';
import './web-services/network-data.spec';
import './web-services/nldi-data.spec';
import './web-services/observations.spec';
import './web-services/statistics-data.spec';

import './networks/network-component/index.spec';
import './networks/network-component/network-legend.spec';
import './networks/selectors/network-data-selector.spec';
import './networks/store/network-store.spec';
import './networks/store/network-data-reducer.spec';
