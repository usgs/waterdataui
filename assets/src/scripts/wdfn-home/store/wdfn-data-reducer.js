import { 
  SET_WDFN_FEATURES, 
  APPLY_GEOGRAPHIC_FILTER, 
  APPLY_SITE_TYPE_FILTER, 
  SET_COUNT 
} from './wdfn-store';

const INITIAL_DATA = {
};

export const wdfnDataReducer = function(wdfnData=INITIAL_DATA, action) {
    switch(action.type) {
        case SET_WDFN_FEATURES:
            return {
                ...wdfnData,
                sites: action.features
            };
        case APPLY_GEOGRAPHIC_FILTER:
            return {
                ...wdfnData,
                filters: {
                    ...wdfnData.filters,
                    bBox: {
                        west: action.west,
                        east: action.east,
                        north: action.north,
                        south: action.south
                    }
                }
            };
        case APPLY_SITE_TYPE_FILTER:
            return {
                ...wdfnData,
                filters: {
                    ...wdfnData.filters,
                    siteTypes: {
                        ...wdfnData.filters.siteTypes,
                        ...action.filter
                    }
                }
            };
        case SET_COUNT:
            return {
                ...wdfnData,
                count: action.count
            };
        default: return wdfnData;
    }
};

