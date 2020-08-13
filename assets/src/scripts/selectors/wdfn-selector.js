import { createSelector } from 'reselect';

export const Sites = state => state.wdfn.sites || {};
export const siteTypes = state => state.wdfn.filters.siteTypes || {};
export const Filters = state => state.wdfn.filters || {};
// const siteTypeFilters = state => state.wdfn.filters.siteTypes || {};

// export const SiteTypes = createSelector(
//   siteTypeFilters,
//   (siteTypes) => {
//     return Object.keys(siteTypes).map(k => siteTypes[k] ? k : null);
//   }
// );
