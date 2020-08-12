import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';

import { Actions, wdfnDataReducer } from './wdfn';
import { link } from '../lib/d3-redux';

const mockFeatures = [
  {
    'geometry': {
      'coordinates': [
        '-110.6855722',
        '44.1140028'
      ]
    },
    'properties': {
      'OrganizationIdentifier': 'USGS-WY',
      'MonitoringLocationName': 'Huckleberry Hot Springs H-3',
      'siteUrl': 'https://www.waterqualitydata.us/data/provider/NWIS/USGS-WY/USGS-440650110410801/',
      'MonitoringLocationIdentifier': 'USGS-440650110410801'
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
      'OrganizationIdentifier': 'USGS-WY',
      'MonitoringLocationName': 'Huckleberry Hot Springs H-1',
      'siteUrl': 'https://www.waterqualitydata.us/data/provider/NWIS/USGS-WY/USGS-440653110411401/',
      'MonitoringLocationIdentifier': 'USGS-440653110411401'
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
      'OrganizationIdentifier': 'USGS-WY',
      'MonitoringLocationName': 'Huckleberry Hot Springs H-2',
      'siteUrl': 'https://www.waterqualitydata.us/data/provider/NWIS/USGS-WY/USGS-440654110411301/',
      'MonitoringLocationIdentifier': 'USGS-440654110411301'
    }
  }
];

describe('store/wdfn module', () => {
  let store;

  beforeEach(() => {
    store = createStore(
      combineReducers({
        wdfn: wdfnDataReducer
      }),
      {
        wdfn: {}
      }
    );
    jasmine.Ajax.install();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  describe('wdfnReducer and Actions', () => {
    describe('setWdfnFeatures', () => {
      store.dispatch(Actions.setWdfnFeatures());
      const wdfnData = store.getState().wdfn;

      it('sets wdfn features with remote data', () => {
        store.dispac;
      });
    });
  });
});
