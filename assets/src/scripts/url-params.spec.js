import {configureStore, Actions} from './store';
import {getParamString, renderTimeSeriesUrlParams} from './url-params';

describe('url-params module', () => {

    describe('getParamString', () => {
        it('should return empty string if no hash', () => {
            window.location.hash = '';

            expect(getParamString()).toEqual('');
        });

        it('should return string minus the leading #', () => {
            window.location.hash = '#parm1=one&parm2=two';

            expect(getParamString()).toEqual('parm1=one&parm2=two');
        });
    });

    describe('renderTimeSeriesUrlParams', () => {
        const TEST_STATE = {
            series: {
                variables: {
                    '123456': {
                        oid: '123456',
                        variableCode: {
                            value: '00010'
                        }
                    },
                    '123457': {
                        oid: '123457',
                        variableCode: {
                            value: '00065'
                        }
                    }
                },
                methods: {
                    '69928': {
                        methodDescription: 'Method 69928',
                        methodID: 69928
                    },
                    '69929': {
                        methodDescription: 'Method 69929',
                        methodID: 69929
                    }
                },
                timeSeries: {
                    '69928:current:P7D': {
                        tsKey: 'current:P7D',
                        method: 69928,
                        variable: '123456'
                    }
                }
            },
            ianaTimeZone: 'America/New_York',
            timeSeriesState: {
                currentVariableID: '123456',
                currentDateRange: 'P7D',
                customTimeRange: null,
                currentMethodID: '69928',
                showSeries: {
                    compare: false
                }
            }
        };
        it('adds nothing to the window.location.hash when the store is empty', () => {
            let store = configureStore({});
            renderTimeSeriesUrlParams(store);
            expect(window.location.hash).toEqual('');
        });

        it('adds parameter code if current variable is set in store', () => {
            let store = configureStore(TEST_STATE);
            renderTimeSeriesUrlParams(store);
            expect(window.location.hash).toContain('parameterCode=00010');
            expect(window.location.hash).not.toContain('compare=true');
            expect(window.location.hash).not.toContain('period');
            expect(window.location.hash).not.toContain('startDT');
            expect(window.location.hash).not.toContain('endDT');
            expect(window.location.hash).not.toContain('timeSeriesId');
        });

        it('adds compare if compare is in the store', () => {
            let store = configureStore({
                ...TEST_STATE,
                timeSeriesState: {
                    ...TEST_STATE.timeSeriesState,
                    showSeries: {
                        compare: true
                    }
                }
            });
            renderTimeSeriesUrlParams(store);

            expect(window.location.hash).toContain('parameterCode=00010');
            expect(window.location.hash).toContain('compare=true');
            expect(window.location.hash).not.toContain('period');
            expect(window.location.hash).not.toContain('startDT');
            expect(window.location.hash).not.toContain('endDT');
            expect(window.location.hash).not.toContain('timeSeriesId');
        });

        it('adds period if current date range is P30D or P1Y', (done) => {
            let store = configureStore({
                ...TEST_STATE,
                timeSeriesState: {
                    ...TEST_STATE.timeSeriesState,
                    currentDateRange: 'P30D'
                }
            });
            renderTimeSeriesUrlParams(store);

            expect(window.location.hash).toContain('parameterCode=00010');
            expect(window.location.hash).not.toContain('compare=true');
            expect(window.location.hash).toContain('period=P30D');
            expect(window.location.hash).not.toContain('startDT');
            expect(window.location.hash).not.toContain('endDT');
            expect(window.location.hash).not.toContain('timeSeriesId');

            store.dispatch(Actions.setCurrentDateRange('P1Y'));
            window.requestAnimationFrame(() => {
                expect(window.location.hash).toContain('period=P1Y');
                done();
            });
        });
        it('Contains startDT and endDT in url if customTimeRange is set in store', () => {
            let store = configureStore({
                ...TEST_STATE,
                timeSeriesState: {
                    ...TEST_STATE.timeSeriesState,
                    currentDateRange: 'custom',
                    customTimeRange: {
                        startDT: 1546318800000,
                        endDT: 1551416400000
                    }
                }
            });
            renderTimeSeriesUrlParams(store);

            expect(window.location.hash).toContain('parameterCode=00010');
            expect(window.location.hash).not.toContain('compare=true');
            expect(window.location.hash).not.toContain('period');
            expect(window.location.hash).toContain('startDT=2019-01-01');
            expect(window.location.hash).toContain('endDT=2019-03-01');
            expect(window.location.hash).not.toContain('timeSeriesId');
        });

        it('expects timeSeriesId to be set if currentMethodId is not null and multiple time series in selected variable', () => {
            let store = configureStore({
                ...TEST_STATE,
                series: {
                    ...TEST_STATE.series,
                    timeSeries: {
                        '69928:current:P7D': {
                            tsKey: 'current:P7D',
                            method: 69928,
                            variable: '123456'
                        },
                        '69929:current:P7D': {
                            tsKey: 'current:P7D',
                            method: 69929,
                            variable: '123456'
                        }
                    }
                }
            });
            renderTimeSeriesUrlParams(store);

            expect(window.location.hash).toContain('parameterCode=00010');
            expect(window.location.hash).not.toContain('compare=true');
            expect(window.location.hash).not.toContain('period');
            expect(window.location.hash).not.toContain('startDT');
            expect(window.location.hash).not.toContain('endDT');
            expect(window.location.hash).toContain('timeSeriesId=69928');
        });
    });
});