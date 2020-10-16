/**
 * This is an entrypoint for the Karma test runner. All tests should be
 * explicitly added here, or they won't be run as part of the test suite.
 *
 * This exists to speed up the execution time of the test suite. The
 * tests and the application dependencies only need to be compiled a single
 * time, and `karma --watch` tasks are very fast.
 */

import 'ui/mock-service-data';
import 'ui/polyfills';

import 'ui/ajax.spec';
import 'ui/schema.spec';
import 'ui/tooltips.spec';
import 'ui/utils.spec';

import 'd3render/accessibility.spec';
import 'd3render/alerts.spec';
import 'd3render/axes.spec';
import 'd3render/cursor-slider.spec';
import 'd3render/data-masks.spec';
import 'd3render/graph-tooltip.spec';
import 'd3render/legend.spec';
import 'd3render/loading-indicator.spec';
import 'd3render/markers.spec';
import 'd3render/tick-marks.spec';

import 'ui/leaflet-rendering/map.spec';
import 'ui/leaflet-rendering/legend-control.spec';

import 'ui/lib/d3-redux.spec';

import 'dvhydrograph/selectors/labels.spec';
import 'dvhydrograph/selectors/legend-data.spec';
import 'dvhydrograph/selectors/scales.spec';
import 'dvhydrograph/selectors/time-series-data.spec';
import 'dvhydrograph/graph-brush.spec';
import 'dvhydrograph/graph-controls.spec';
import 'dvhydrograph/index.spec';
import 'dvhydrograph/time-series-graph.spec';
import 'dvhydrograph/tooltip.spec';

import 'ml/components/embed.spec';

import 'ivhydrograph/selectors/cursor.spec';
import 'ivhydrograph/selectors/domain.spec';
import 'ivhydrograph/selectors/drawing-data.spec';
import 'ivhydrograph/selectors/layout.spec';
import 'ivhydrograph/selectors/parameter-data.spec';
import 'ivhydrograph/selectors/scales.spec';
import 'ivhydrograph/selectors/time-series-data.spec';

import 'ivhydrograph/audible.spec';
import 'ivhydrograph/date-controls.spec';
import 'ivhydrograph/data-table.spec';
import 'ivhydrograph/graph-brush.spec';
import 'ivhydrograph/graph-controls.spec';
import 'ivhydrograph/hydrograph-utils.spec';
import 'ivhydrograph/index.spec';
import 'ivhydrograph/legend.spec';
import 'ivhydrograph/method-picker.spec';
import 'ivhydrograph/parameters.spec';
import 'ivhydrograph/time-series-graph.spec';
import 'ivhydrograph/tooltip.spec';

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
import 'ui/network/components/network-sites/data-table.spec';
import 'ui/network/components/network-sites/index.spec';
import 'ui/network/components/network-sites/legend.spec';
import 'ui/network/selectors/network-data-selector.spec';
import 'ui/network/store/index.spec';
import 'ui/network/store/network-data-reducer.spec';

import 'ui/web-services/flood-data.spec';
import 'ui/web-services/models.spec';
import 'ui/web-services/network-data.spec';
import 'ui/web-services/nldi-data.spec';
import 'ui/web-services/observations.spec';
import 'ui/web-services/statistics-data.spec';
