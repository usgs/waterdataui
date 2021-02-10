import memoize from 'fast-memoize';
import uniq from 'lodash/uniq';
import _includes from 'lodash/includes';
import {DateTime} from 'luxon';
import {createSelector} from 'reselect';

import {getIanaTimeZone} from './time-zone-selector';

/*
 * Selectors that return properties from the state
 */

export const getShowIVTimeSeries = state => state.ivTimeSeriesState.showIVTimeSeries  || {};

export const getUserInputsForSelectingTimespan = state => state.ivTimeSeriesState.userInputsForTimeRange;

export const getCurrentVariableID = state => state.ivTimeSeriesState.currentIVVariableID;

export const getCurrentMethodID = state => state.ivTimeSeriesState.currentIVMethodID;

export const getCurrentParameterCode = state => state.ivTimeSeriesState.currentParameterCode;

export const getCurrentDateRange = (state) => {
    return state.ivTimeSeriesState.currentIVDateRange || null;
};

export const getIVGraphBrushOffset = state => state.ivTimeSeriesState.ivGraphBrushOffset || null;

export const getLoadingTsKeys = state => state.ivTimeSeriesState.loadingIVTSKeys || [];

export const getCustomTimeRange = state => state.ivTimeSeriesState.customIVTimeRange;
