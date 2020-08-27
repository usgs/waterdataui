import { 
  SET_WDFN_FEATURES, 
  APPLY_GEOGRAPHIC_FILTER, 
  APPLY_SITE_TYPE_FILTER, 
  APPLY_PARAMETER_FILTER,
  SET_COUNT,
  APPLY_PERIOD_FILTER
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
        case APPLY_PARAMETER_FILTER:
          return {
              ...wdfnData,
              filters: {
                ...wdfnData.filters,
                parameters: action.pCodes
              }
          };
        case APPLY_PERIOD_FILTER:
          return {
              ...wdfnData,
              filters: {
                ...wdfnData.filters,
                timePeriod: action.startDate
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

