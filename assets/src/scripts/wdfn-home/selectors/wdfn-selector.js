import { createSelector } from 'reselect';

export const getLoadingState = state => state.wdfnData.uiState.loading || '';
export const Sites = state => state.wdfnData.sites || {};
export const siteTypes = state => state.wdfnData.filters.siteTypes || {};
export const Filters = state => state.wdfnData.filters || {};
export const Count = state => state.wdfnData.count || {};
