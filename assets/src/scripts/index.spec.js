/**
 * This is an entrypoint for the Karma test runner. All tests should be
 * explicitly added here, or they won't be run as part of the test suite.
 *
 * This exists to speed up the execution time of the test suite. The
 * tests and the application dependencies only need to be compiled a single
 * time, and `karma --watch` tasks are very fast.
 */

import './accessibility.spec';
import './ajax.spec';
import './components/embed.spec';
import './components/hydrograph/audible.spec';
import './components/hydrograph/axes.spec';
import './components/hydrograph/cursor.spec';
import './components/hydrograph/domain.spec';
import './components/hydrograph/drawingData.spec';
import './components/hydrograph/index.spec';
import './components/hydrograph/layout.spec';
import './components/hydrograph/legend.spec';
import './components/hydrograph/markers.spec';
import './components/hydrograph/parameters.spec';
import './components/hydrograph/scales.spec';
import './components/hydrograph/timeSeries.spec';
import './components/hydrograph/tooltip.spec';
import './components/map/floodSlider.spec';
import './components/map/index.spec';
import './components/map/legend.spec';
import './floodData.spec';
import './helpers.spec';
import './layout.spec';
import './models.spec';
import './schema.spec';
import './selectors/floodDataSelector.spec';
import './selectors/medianStatisticsSelector.spec';
import './selectors/timeSeriesSelector.spec';
import './statisticsData.spec';
import './store/floodDataReducer.spec';
import './store/floodStateReducer.spec';
import './store/index.spec';
import './store/seriesReducer.spec';
import './store/timeSeriesStateReducer.spec';
import './store/uiReducer.spec';
import './tooltips.spec';
import './utils.spec';

export var dummy = true;
