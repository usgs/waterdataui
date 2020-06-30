import { createSelector } from 'reselect';

export const Sites = state => state.waterquality || ['foo'];
