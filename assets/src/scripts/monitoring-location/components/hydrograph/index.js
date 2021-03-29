/*
 * Hydrograph charting module.
 */
import {select} from 'd3-selection';
import {DateTime} from 'luxon';

import config from 'ui/config.js';

import {drawInfoAlert} from 'd3render/alerts';

import {renderTimeSeriesUrlParams} from 'ml/url-params';

import {retrieveHydrographData} from 'ml/store/hydrograph-data';
import {retrieveHydrographParameters} from 'ml/store/hydrograph-parameters';
import {setSelectedParameterCode, setCompareDataVisibility, setSelectedTimeSpan,
    setSelectedIVMethodID
} from 'ml/store/hydrograph-state';

import {Actions as floodDataActions} from 'ml/store/flood-inundation';

import {getPreferredIVMethodID} from './selectors/time-series-data';

import {showDataIndicators} from './data-indicator';
import {drawDataTables} from './data-table';
import {drawGraphBrush} from './graph-brush';
import {drawGraphControls} from './graph-controls';
import {drawTimeSeriesLegend} from './legend';
import {drawMethodPicker} from './method-picker';
import {drawSelectionList} from './parameters';
import {drawSelectActions} from './select-actions';
import {drawShortcutDaysBeforeButtons} from './days-before-shortcuts';
import {drawTimeSeriesGraph} from './time-series-graph';
import {drawTooltipCursorSlider} from './tooltip';

/*
 * Renders the hydrograph on the node element using the Redux store for state information. The siteno, latitude, and
 * longitude are required parameters. All others are optional and are used to set the initial state of the hydrograph.
 * @param {Redux store} store
 * @param {DOM node} node
 * @param {Object} - string properties to set initial state information. The property siteno is required
 * @param {Promise} loadPromise - will resolve when any data needed by this module
 *                                that is fetched by the caller has been fetched
 * */
export const attachToNode = function(store,
                                     node,
                                     {
                                         siteno,
                                         agencyCd,
                                         sitename,
                                         parameterCode,
                                         compare,
                                         period,
                                         startDT,
                                         endDT,
                                         timeSeriesId,
                                         showOnlyGraph = false,
                                         showMLName = false
                                     } = {}) {
    const nodeElem = select(node);
    if (!config.ivPeriodOfRecord && !config.gwPeriodOfRecord) {
        select(node).select('.graph-container').call(drawInfoAlert, {title: 'Hydrograph Alert', body: 'No IV or field visit data is available.'});
        return;
    }

    showDataIndicators(true);

    const initialPeriod = startDT && endDT ? 'custom' : period || 'P7D';
    const initialStartTime = startDT ?
        DateTime.fromISO(startDT, {zone: config.locationTimeZone}).toISO() : null;
    const initialEndTime = endDT ?
        DateTime.fromISO(endDT, {zone: config.locationTimeZone}).endOf('day').toISO() : null;
    const initialLoadCompare = compare === 'true' || compare === true ? true : false;
    const thisShowOnlyGraph = showOnlyGraph === 'true' || showOnlyGraph === true ? true : false;
    const thisShowMLName = showMLName === 'true' || showMLName === true ? true : false;
    const fetchHydrographDataPromise = store.dispatch(retrieveHydrographData(siteno, {
        parameterCode: parameterCode,
        period: initialPeriod === 'custom' ? null : initialPeriod,
        startTime: initialStartTime,
        endTime: initialEndTime,
        loadCompare: initialLoadCompare,
        loadMedian: false
    }));

    // if showing the controls, fetch the parameters
    let fetchParametersPromise;
    if (!thisShowOnlyGraph) {
        fetchParametersPromise = store.dispatch(retrieveHydrographParameters(siteno));
    }

    // Initialize all hydrograph state variables if showing the control
    store.dispatch(setSelectedParameterCode(parameterCode));
    store.dispatch(setCompareDataVisibility(initialLoadCompare));
    if (period) {
        store.dispatch(setSelectedTimeSpan(period));
    } else if (startDT && endDT) {
        store.dispatch(setSelectedTimeSpan({
            start: startDT,
            end: endDT
        }));
    } else {
        store.dispatch(setSelectedTimeSpan('P7D'));
    }

    // Fetch waterwatch flood levels
    const fetchFloodLevelsPromise = store.dispatch(floodDataActions.retrieveWaterwatchData(siteno));

    let fetchDataPromises = [fetchHydrographDataPromise];
    // If flood levels are to be shown then wait to render the hydrograph until those have been fetched.
    if (parameterCode === config.GAGE_HEIGHT_PARAMETER_CODE) {
        fetchDataPromises.push(fetchFloodLevelsPromise);
    }
    Promise.all(fetchDataPromises).then(() => {
        // selectedIVMethodID should be set regardless of whether we are showing only the graph but the preferred method ID
        // can not be determined until the data is fetched so that is done here.
        const initialIVMethodID = timeSeriesId || getPreferredIVMethodID(store.getState());
        store.dispatch(setSelectedIVMethodID(initialIVMethodID));

        showDataIndicators(false, store);
        let graphContainer = nodeElem.select('.graph-container');
        graphContainer.call(drawTimeSeriesGraph, store, siteno, agencyCd, sitename, thisShowMLName, !thisShowOnlyGraph);

        if (!thisShowOnlyGraph) {
            graphContainer
                .call(drawTooltipCursorSlider, store)
                .call(drawGraphBrush, store);
        }
        const legendControlsContainer = graphContainer.append('div')
            .classed('ts-legend-controls-container', true)
            .call(drawTimeSeriesLegend, store);

        if (!thisShowOnlyGraph) {
            nodeElem.select('.short-cut-days-before-container').call(drawShortcutDaysBeforeButtons, store, siteno);
            nodeElem.select('.select-actions-container').call(drawSelectActions, store, siteno);
            nodeElem.select('#hydrograph-method-picker-container')
                .call(drawMethodPicker, store);

            legendControlsContainer.call(drawGraphControls, store, siteno);

            nodeElem.select('#iv-data-table-container')
                .call(drawDataTables, store);

            fetchParametersPromise.then(() => {
                nodeElem.select('.select-time-series-container')
                    .call(drawSelectionList, store, siteno);
            });
            renderTimeSeriesUrlParams(store);
        }
    })
    .catch(reason => {
        console.error(reason);
        throw reason;
    });
};
