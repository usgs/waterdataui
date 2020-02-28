import { createSelector } from 'reselect';

export const getNldiUpstreamSites = state => state.nldiData.upstreamSites;
export const getNldiUpstreamFlows = state => state.nldiData.upstreamFlows;
export const getNldiDownstreamSites = state => state.nldiData.downstreamSites;
export const getNldiDownstreamFlows = state => state.nldiData.downstreamFlows;
export const getNldiUpstreamBasin = state => state.nldiData.upstreamBasin;

/*
 * Provides a function which returns True if nldi data is not empty.
 */
export const hasNldiData = createSelector(
    getNldiUpstreamFlows,
    getNldiDownstreamFlows,
    getNldiUpstreamSites,
    getNldiDownstreamSites,
    getNldiUpstreamBasin,
    (upstreamFlows, downstreamFlows, upstreamSites, downstreamSites, upstreamBasin) =>
        upstreamFlows.length > 0 ||
        downstreamFlows.length > 0 ||
        upstreamSites.length > 0 ||
        downstreamSites.length > 0 ||
        upstreamBasin.length > 0
);
