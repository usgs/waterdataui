import { createSelector } from 'reselect';

export const Sites = state => state.waterquality.sites || {};
export const Filters = state => state.waterquality.filters.characteristics || {};
