let proxyquire = require('proxyquireify')(require);

const { Actions, timeSeriesReducer } = require('./store');

fdescribe('Redux store', () => {
    // TODO: Add tests for retrieveTimeseries, retrieveCompareTimeseries, and retrieveFloodData
    describe('asynchronous actions', () => {
        describe('retrieveFloodData with data', () => {
            let store;
            let floodDataMock;
            let mockDispatch;

            const SITE_NO = '12345678';
            beforeEach(() => {
                let getFeaturePromise = Promise.resolve([{
                    attributes: {
                        USGSI: '03341500',
                        STAGE: 30
                    }
                }, {
                    attributes: {
                        USGSID: '03341500',
                        STAGE: 29
                    }
                }, {
                    attributes: {
                        USGSID: '03341500',
                        STAGE: 28
                    }
                }]);
                let getExtentPromise = Promise.resolve({
                    extent: {
                        xmin: -84.35321,
                        ymin: 34.01666,
                        xmax: 84.22346,
                        ymax: 34.1010
                    },
                    spatialReference: {
                        wkid: 4326,
                        latestWkid: 4326
                    }
                });

                floodDataMock = {
                    fetchFloodFeatures: function () {
                        return getFeaturePromise;
                    },
                    fetchFloodExtent: function () {
                        return getExtentPromise;
                    }
                };

                spyOn(floodDataMock, 'fetchFloodFeatures').and.callThrough();
                spyOn(floodDataMock, 'fetchFloodExtent').and.callThrough();
                store = proxyquire('./store', {'./floodData': floodDataMock});

            });

            it('Make fetch call for both features and extent', () => {
                store.Actions.retrieveFloodData(SITE_NO)(mockDispatch);

                expect(floodDataMock.fetchFloodFeatures).toHaveBeenCalledWith(SITE_NO);
                expect(floodDataMock.fetchFloodExtent).toHaveBeenCalledWith(SITE_NO);
            });

            it('dispatches a setFloodFeatures action after promises are resolved', (done) => {
                let mockDispatch = jasmine.createSpy('mockDispatch');
                spyOn(store.Actions, 'setFloodFeatures').and.callThrough();
                let p = store.Actions.retrieveFloodData(SITE_NO)(mockDispatch);

                p.then(() => {
                    expect(mockDispatch).toHaveBeenCalled();
                    expect(store.Actions.setFloodFeatures).toHaveBeenCalledWith([28, 29, 30], {
                        xmin: -84.35321,
                        ymin: 34.01666,
                        xmax: 84.22346,
                        ymax: 34.1010
                    });

                    done();
                });
            });
        });

        describe('retrieveFloodData with no data', () => {
            let store;
            let floodDataMock;
            let mockDispatch;

            const SITE_NO = '12345678';
            beforeEach(() => {
                let getFeaturePromise = Promise.resolve([]);
                let getExtentPromise = Promise.resolve({
                    xmin: 'NaN',
                    ymin: 'NaN',
                    xmax: 'NaN',
                    ymax: 'NaN'
                });

                floodDataMock = {
                    fetchFloodFeatures: function() { return getFeaturePromise; },
                    fetchFloodExtent: function() { return getExtentPromise; }
                };

                spyOn(floodDataMock, 'fetchFloodFeatures').and.callThrough();
                spyOn(floodDataMock, 'fetchFloodExtent').and.callThrough();
                store = proxyquire('./store', {'./floodData': floodDataMock});

            });

            it('dispatches a setFloodFeatures action after promises are resolved', (done) => {
                let mockDispatch = jasmine.createSpy('mockDispatch');
                spyOn(store.Actions, 'setFloodFeatures').and.callThrough();
                let p = store.Actions.retrieveFloodData(SITE_NO)(mockDispatch);

                p.then(() => {
                    expect(mockDispatch).toHaveBeenCalled();
                    expect(store.Actions.setFloodFeatures).toHaveBeenCalledWith([], {});


                    done();
                });
            });
        });
    });

    describe('synchronous actions', () => {
        it('should create an action to set flood features state', () => {
            expect(Actions.setFloodFeatures([9, 10, 11], {xmin: -87, ymin: 42, xmax: -86, ymax: 43})).toEqual({
                type: 'SET_FLOOD_FEATURES',
                stages: [9, 10, 11],
                extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
            });
        });

        it('should create an action to update the gage height state', () => {
            expect(Actions.setGageHeight(1)).toEqual({
                type: 'SET_GAGE_HEIGHT',
                gageHeightIndex: 1
            });
        });

        it('should create an action to toggle timeseries view state', () => {
            expect(Actions.toggleTimeseries('current', true)).toEqual({
                type: 'TOGGLE_TIMESERIES',
                key: 'current',
                show: true
            });
        });

        it('should create an action to add a timeseries collection', () => {
            expect(Actions.addSeriesCollection('current', 'collection')).toEqual({
                type: 'ADD_TIMESERIES_COLLECTION',
                key: 'current',
                show: true,
                data: 'collection'
            });
        });

        it('should create an action to reset a timeseries', () => {
            expect(Actions.resetTimeseries('current')).toEqual({
                type: 'RESET_TIMESERIES',
                key: 'current'
            });
        });

        it('should create an action to show the median stats label', () => {
            expect(Actions.showMedianStatsLabel(true)).toEqual({
                type: 'SHOW_MEDIAN_STATS_LABEL',
                show: true
            });

        });

        it('should create an action to resize plot', () => {
            expect(Actions.resizeUI(800, 100)).toEqual({
                type: 'RESIZE_UI',
                windowWidth: 800,
                width: 100
            });
        });

        it('should create an action to set the tooltip time', () => {
            expect(Actions.setTooltipTime(new Date('2018-01-03'), new Date('2017-01-03'))).toEqual({
                type: 'SET_TOOLTIP_TIME',
                currentTime: new Date('2018-01-03'),
                compareTime: new Date('2017-01-03')
            });
        });

        it('should create an action to toggle audible interface', () => {
            expect(Actions.toggleAudibleInterface(true)).toEqual({
                type: 'AUDIBLE_INTERFACE_TOGGLE',
                audibleInterfaceOn: true
            });
        });
    });

    describe('reducers', () => {
        it('should handle ADD_TIMESERIES_COLLECTION', () => {
            expect(timeSeriesReducer({series: {}}, {
                type: 'ADD_TIMESERIES_COLLECTION',
                data: {
                    stateToMerge: {},
                    variables: {
                        'varId': {
                            oid: 'varId',
                            variableCode: {
                                value: 1
                            }
                        }
                    }
                },
                show: true,
                key: 'current'
            })).toEqual({
                series: {
                    stateToMerge: {},
                    variables: {
                        'varId': {
                            oid: 'varId',
                            variableCode: {
                                value: 1
                            }
                        }
                    }
                },
                showSeries: {
                    current: true
                },
                currentVariableID: 'varId'
            });
        });

        it('should handle SET_FLOOD_FEATURES', () => {
            expect(timeSeriesReducer({}, {
                type: 'SET_FLOOD_FEATURES',
                stages: [9, 10, 11],
                extent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43}
            })).toEqual({
                floodStages: [9, 10, 11],
                floodExtent: {xmin: -87, ymin: 42, xmax: -86, ymax: 43},
                gageHeight: 9
            });
        });

        it('should handle TOGGLE_TIMESERIES', () => {
            expect(timeSeriesReducer({}, {
                type: 'TOGGLE_TIMESERIES',
                key: 'current',
                show: true
            })).toEqual({
                showSeries: {
                    current: true
                }
            });
        });

        it('should handle RESET_TIMESERIES', () => {
            expect(timeSeriesReducer({}, {
                type: 'RESET_TIMESERIES',
                key: 'previous'
            })).toEqual({
                showSeries: {
                    previous: false
                },
                series: {
                    request: {}
                }
            });
        });

        it('should handle SHOW_MEDIAN_STATS_LABEL', () => {
            expect(timeSeriesReducer({}, {
                type: 'SHOW_MEDIAN_STATS_LABEL',
                show: true
            })).toEqual({
                showMedianStatsLabel: true
            });
        });

        it('should handle RESIZE_UI', () => {
            expect(timeSeriesReducer({}, {
                type: 'RESIZE_UI',
                windowWidth: 800,
                width: 100
            })).toEqual({
                windowWidth: 800,
                width: 100
            });
        });

        it('should handle SET_TOOLTIP_TIME', () => {
            expect(timeSeriesReducer({}, {
                type: 'SET_TOOLTIP_TIME',
                currentTime: new Date('2018-01-03'),
                compareTime: new Date('2017-01-03')
            })).toEqual({
                tooltipFocusTime: {
                    current: new Date('2018-01-03'),
                    compare: new Date('2017-01-03')
                }
            });
        });

        it('should handle SET_GAGE_HEIGHT', () => {
           expect(timeSeriesReducer({floodStages: [9, 10, 11], gageHeight: 9}, {
               type: 'SET_GAGE_HEIGHT',
               gageHeightIndex: 1
           })).toEqual({
               floodStages: [9, 10, 11],
               gageHeight: 10
           });
        });

        it('should handle AUDIBLE_INTERFACE_TOGGLE', () => {
           expect(timeSeriesReducer({audibleInterfaceOn: false}, {
               type: 'AUDIBLE_INTERFACE_TOGGLE',
               audibleInterfaceOn: true
           })).toEqual({
               audibleInterfaceOn: true
           });
        });
    });
});
