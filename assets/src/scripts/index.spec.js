/**
 * This is an entrypoint for the Karma test runner. All tests should be
 * explicitly added here, or they won't be run as part of the test suite.
 *
 * This exists to speed up the execution time of the test suite. The
 * tests and the application dependencies only need to be compiled a single
 * time, and `karma --watch` tasks are very fast.
 */

import './polyfills';

import './ajax.spec';

import './d3-rendering/accessibility.spec';
import './d3-rendering/alerts.spec';
import './d3-rendering/axes.spec';
import './d3-rendering/cursor-slider.spec';
import './d3-rendering/loading-indicator.spec';
import './d3-rendering/graph-tooltip.spec';

import './components/dailyValueHydrograph/selectors/labels.spec';
import './components/dailyValueHydrograph/selectors/scales.spec';
import './components/dailyValueHydrograph/selectors/time-series-data.spec';

import './components/dailyValueHydrograph/index.spec';
import './components/dailyValueHydrograph/time-series-graph.spec';
import './components/dailyValueHydrograph/tooltip.spec';

import './components/embed.spec';

import './components/hydrograph/audible.spec';
import './components/hydrograph/axes.spec';
import './components/hydrograph/cursor.spec';
import './components/hydrograph/date-controls.spec';
import './components/hydrograph/domain.spec';
import './components/hydrograph/drawing-data.spec';
import './components/hydrograph/graph-brush.spec';
import './components/hydrograph/graph-controls.spec';
import './components/hydrograph/index.spec';
import './components/hydrograph/layout.spec';
import './components/hydrograph/legend.spec';
import './d3-rendering/markers.spec';
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

import './selectors/flood-data-selector.spec';
import './selectors/nldi-data-selector.spec';
import './selectors/median-statistics-selector.spec';
import './selectors/observations-selector.spec';
import './selectors/time-series-selector.spec';

import './store/flood-data-reducer.spec';
import './store/nldi-data-reducer.spec';
import './store/flood-state-reducer.spec';
import './store/index.spec';
import './store/observations-data-reducer.spec';
import './store/observations-state-reducer.spec';
import './store/series-reducer.spec';
import './store/time-series-state-reducer.spec';
import './store/ui-reducer.spec';

import './tooltips.spec';
import './url-params.spec';
import './utils.spec';

import './web-services/flood-data.spec';
import './web-services/models.spec';
import './web-services/nldi-data.spec';
import './web-services/observations-spec';
import './web-services/statistics-data.spec';
