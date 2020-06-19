import { createSelector } from 'reselect';

export const Features = state => state.observations.features || ['foo'];
