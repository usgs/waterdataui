import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';
import {wdfnDataReducer} from './wdfn-data-reducer';
import {Actions, STORE_STRUCTURE, retrieveWdfnData} from './wdfn-store';

const MOCK_WDFN_FEATURES = {
  'data': {
    'monitoringLocations': {
      'features': [{
        'geometry': {
          'coordinates': [
            '-110.6855722',
            '44.1140028'
          ]
        },
        'properties': {
          'organizationIdentifier': 'USGS-WY',
          'monitoringLocationName': 'Huckleberry Hot Springs H-3',
          'siteUrl': 'https://www.waterqualitydata.us/data/provider/NWIS/USGS-WY/USGS-440650110410801/',
          'monitoringLocationIdentifier': 'USGS-440650110410801'
        }
      },
      {
        'geometry': {
          'coordinates': [
            '-110.6872028',
            '44.1147167'
          ]
        },
        'properties': {
          'organizationIdentifier': 'USGS-WY',
          'monitoringLocationName': 'Huckleberry Hot Springs H-1',
          'siteUrl': 'https://www.waterqualitydata.us/data/provider/NWIS/USGS-WY/USGS-440653110411401/',
          'monitoringLocationIdentifier': 'USGS-440653110411401'
        }
      },
      {
        'geometry': {
          'coordinates': [
            '-110.6869556',
            '44.1148944'
          ]
        },
        'properties': {
          'organizationIdentifier': 'USGS-WY',
          'monitoringLocationName': 'Huckleberry Hot Springs H-2',
          'siteUrl': 'https://www.waterqualitydata.us/data/provider/NWIS/USGS-WY/USGS-440654110411301/',
          'monitoringLocationIdentifier': 'USGS-440654110411301'
        }
      }
    ]}
  }
};

describe('WDFN store', () => {
  let store;

  beforeEach(() => {
    store = createStore(
        combineReducers({
            wdfnData: wdfnDataReducer
        }),
        STORE_STRUCTURE,
        applyMiddleware(thunk)
    );

    jasmine.Ajax.install();
  });

  afterEach(() => {
      jasmine.Ajax.uninstall();
  });

  describe('wdfnDataReducer', () => {
    describe('setSiteTypeFilter', () => {
      it('sets the site type filter', () => {
        store.dispatch(Actions.setSiteTypeFilter({ spring: true }));

        const wdfnData = store.getState().wdfnData;
        expect(wdfnData.filters.siteTypes.spring).toEqual(true);
      });
    });
  });

  describe('retrieveWdfnData', () => {
    it('queries the graphql API', () => {
      store.dispatch(retrieveWdfnData({
        siteTypes: { 
          spring: true
        },
        bBox: {
          west: '0',
          south: '0',
          east: '0',
          north: '0'
        }
      }));

      const request = jasmine.Ajax.requests.mostRecent();

      expect(jasmine.Ajax.requests.count()).toEqual(1);
      expect(request.url).toEqual('/graphql');

      jasmine.Ajax.requests.at(0).respondWith({
        status: 200,
        responseText: JSON.stringify(MOCK_WDFN_FEATURES)
      });
    });
  });
});
