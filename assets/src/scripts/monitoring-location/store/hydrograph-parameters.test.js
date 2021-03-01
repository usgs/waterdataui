import mockConsole from 'jest-mock-console';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {default as thunk} from 'redux-thunk';
import sinon from 'sinon';

import config from 'ui/config';
import {MOCK_LATEST_IV_DATA, MOCK_LATEST_GW_DATA} from 'ui/mock-service-data';

import * as ivDataService from 'ui/web-services/instantaneous-values';
import * as groundwaterLevelService from 'ui/web-services/groundwater-levels';

import {hydrographParametersReducer, retrieveHydrographParameters} from './hydrograph-parameters';

describe('monitoring-location/store/hydrograph-parameters', () => {
    let store;
    let fakeServer;
    let restoreConsole;

    beforeEach(() => {
        store = createStore(
            combineReducers({
                hydrographParameters: hydrographParametersReducer
            }),
            {
                hydrographParameters: {}
            },
            applyMiddleware(thunk)
        );
        fakeServer = sinon.createFakeServer();
        restoreConsole = mockConsole();
    });

    afterEach(() => {
        fakeServer.restore();
        restoreConsole();
    });

    describe('retrieveHydrographParameters', () => {

        beforeEach(() => {
            config.ivPeriodOfRecord = {
                '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
            };
            config.gwPeriodOfRecord = {
                '00060': {begin_date: '2010-01-01', end_date: '2020-01-01'}
            };
            ivDataService.fetchTimeSeries =
                jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_LATEST_IV_DATA)));
            groundwaterLevelService.fetchGroundwaterLevels =
                jest.fn().mockReturnValue(Promise.resolve(JSON.parse(MOCK_LATEST_GW_DATA)));
        });

        it('Expects the latest IV and GW data to be fetched', () => {
            store.dispatch(retrieveHydrographParameters('11112222'));

            const mockIVCalls = ivDataService.fetchTimeSeries.mock.calls;
            const mockGWCalls = groundwaterLevelService.fetchGroundwaterLevels.mock.calls;

            expect(mockIVCalls).toHaveLength(1);
            expect(mockIVCalls[0][0]).toEqual({
                sites: ['11112222']
            });
            expect(mockGWCalls).toHaveLength(1);
            expect(mockGWCalls[0][0]).toEqual({
                site: '11112222'
            });
        });

        it('Expects only IV data to be fetched if no period of record for gw', () => {
            config.gwPeriodOfRecord = null;
            store.dispatch(retrieveHydrographParameters('11112222'));

            const mockIVCalls = ivDataService.fetchTimeSeries.mock.calls;
            const mockGWCalls = groundwaterLevelService.fetchGroundwaterLevels.mock.calls;

            expect(mockIVCalls).toHaveLength(1);
            expect(mockGWCalls).toHaveLength(0);
        });

        it('Expects only Gw data to be fetched if no period of record for iv', () => {
            config.ivPeriodOfRecord = null;
            store.dispatch(retrieveHydrographParameters('11112222'));

            const mockIVCalls = ivDataService.fetchTimeSeries.mock.calls;
            const mockGWCalls = groundwaterLevelService.fetchGroundwaterLevels.mock.calls;

            expect(mockIVCalls).toHaveLength(0);
            expect(mockGWCalls).toHaveLength(1);
        });

        it('Expects the Redux store to save the parameters from both IV and GW calls', () => {
            return store.dispatch(retrieveHydrographParameters('11112222')).then(() => {
                const hydrographParameters = store.getState().hydrographParameters;

                expect(hydrographParameters['00010']).toBeDefined();
                expect(hydrographParameters['00010F']).toBeDefined();
                expect(hydrographParameters['72019']).toBeDefined();
                expect(hydrographParameters['62610']).toBeDefined();
                expect(hydrographParameters['62611']).toBeDefined();
                expect(hydrographParameters['00010'].hasIVData).toBeTruthy();
                expect(hydrographParameters['00010F'].hasIVData).toBeTruthy();
                expect(hydrographParameters['72019'].hasIVData).toBeTruthy();
                expect(hydrographParameters['62610'].hasIVData).toBeFalsy();
                expect(hydrographParameters['62611'].hasIVData).toBeFalsy();
                expect(hydrographParameters['00010'].hasGWLevelsData).toBeFalsy();
                expect(hydrographParameters['00010F'].hasGWLevelsData).toBeFalsy();
                expect(hydrographParameters['72019'].hasGWLevelsData).toBeTruthy();
                expect(hydrographParameters['62610'].hasGWLevelsData).toBeTruthy();
                expect(hydrographParameters['62611'].hasGWLevelsData).toBeTruthy();
            });
        });
    });
});

