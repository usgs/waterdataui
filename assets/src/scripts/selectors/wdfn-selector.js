import { createSelector } from 'reselect';

export const Sites = state => state.wdfn.sites || {};
export const siteTypes = state => state.wdfn.filters.siteTypes || {};
export const Filters = state => state.wdfn.filters || {};
